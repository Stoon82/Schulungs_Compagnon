const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../services/database');

/**
 * Gamification API Routes
 * Points system, leaderboard, badges, achievements, and streaks
 */

// Points configuration
const POINTS_CONFIG = {
  quiz_participation: 10,
  quiz_correct_answer: 5,
  quiz_perfect_score: 50,
  poll_participation: 5,
  wordcloud_contribution: 5,
  module_completion: 100,
  submodule_completion: 20,
  daily_login: 10,
  streak_bonus_multiplier: 1.5
};

// POST /api/gamification/points/award - Award points to user
router.post('/points/award', async (req, res) => {
  try {
    const { userId, sessionId, points, reason, activityType, activityId } = req.body;

    if (!userId || !points || !reason || !activityType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const pointId = uuidv4();
    
    // Insert point record
    await db.run(
      `INSERT INTO user_points (id, user_id, session_id, points, reason, activity_type, activity_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [pointId, userId, sessionId, points, reason, activityType, activityId]
    );

    // Update total points
    const existing = await db.get(
      'SELECT * FROM user_total_points WHERE user_id = ?',
      [userId]
    );

    if (existing) {
      const updates = {
        total_points: existing.total_points + points,
        session_points: activityType === 'quiz' ? existing.session_points + points : existing.session_points,
        quiz_points: activityType === 'quiz' ? existing.quiz_points + points : existing.quiz_points,
        interaction_points: ['poll', 'wordcloud', 'participation'].includes(activityType) 
          ? existing.interaction_points + points 
          : existing.interaction_points
      };

      await db.run(
        `UPDATE user_total_points 
         SET total_points = ?, session_points = ?, quiz_points = ?, interaction_points = ?, last_updated = ?
         WHERE user_id = ?`,
        [updates.total_points, updates.session_points, updates.quiz_points, updates.interaction_points, new Date().toISOString(), userId]
      );
    } else {
      await db.run(
        `INSERT INTO user_total_points (user_id, total_points, session_points, quiz_points, interaction_points)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, points, activityType === 'quiz' ? points : 0, activityType === 'quiz' ? points : 0, 
         ['poll', 'wordcloud', 'participation'].includes(activityType) ? points : 0]
      );
    }

    // Check for badge achievements
    await checkBadgeAchievements(userId);

    res.json({
      success: true,
      data: { id: pointId, pointsAwarded: points }
    });
  } catch (error) {
    console.error('Error awarding points:', error);
    res.status(500).json({ success: false, error: 'Failed to award points' });
  }
});

// GET /api/gamification/points/:userId - Get user points
router.get('/points/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const totals = await db.get(
      'SELECT * FROM user_total_points WHERE user_id = ?',
      [userId]
    );

    const recentActivity = await db.all(
      `SELECT * FROM user_points 
       WHERE user_id = ? 
       ORDER BY earned_at DESC 
       LIMIT 20`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        totalPoints: totals?.total_points || 0,
        sessionPoints: totals?.session_points || 0,
        quizPoints: totals?.quiz_points || 0,
        interactionPoints: totals?.interaction_points || 0,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Error fetching points:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch points' });
  }
});

// GET /api/gamification/leaderboard - Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { sessionId, moduleId, limit = 10, anonymous = false } = req.query;

    let query = `
      SELECT utp.user_id, utp.total_points, 
             ROW_NUMBER() OVER (ORDER BY utp.total_points DESC) as rank
      FROM user_total_points utp
    `;

    const params = [];

    if (sessionId) {
      query = `
        SELECT up.user_id, SUM(up.points) as total_points,
               ROW_NUMBER() OVER (ORDER BY SUM(up.points) DESC) as rank
        FROM user_points up
        WHERE up.session_id = ?
        GROUP BY up.user_id
      `;
      params.push(sessionId);
    }

    query += ` ORDER BY total_points DESC LIMIT ?`;
    params.push(parseInt(limit));

    const leaderboard = await db.all(query, params);

    // Anonymize if requested
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: entry.rank || index + 1,
      userId: anonymous ? `User ${entry.rank || index + 1}` : entry.user_id,
      userName: anonymous ? `Teilnehmer ${entry.rank || index + 1}` : entry.user_id,
      totalPoints: entry.total_points,
      isAnonymous: anonymous
    }));

    res.json({
      success: true,
      data: formattedLeaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
  }
});

// GET /api/gamification/badges - Get all badge definitions
router.get('/badges', async (req, res) => {
  try {
    const badges = await db.all('SELECT * FROM badge_definitions ORDER BY rarity, category');

    res.json({
      success: true,
      data: badges.map(b => ({
        ...b,
        criteria: JSON.parse(b.criteria)
      }))
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch badges' });
  }
});

// GET /api/gamification/badges/:userId - Get user badges
router.get('/badges/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const earnedBadges = await db.all(
      `SELECT ub.*, bd.name, bd.description, bd.icon, bd.category, bd.rarity
       FROM user_badges ub
       JOIN badge_definitions bd ON ub.badge_id = bd.id
       WHERE ub.user_id = ?
       ORDER BY ub.earned_at DESC`,
      [userId]
    );

    const allBadges = await db.all('SELECT * FROM badge_definitions');

    res.json({
      success: true,
      data: {
        earned: earnedBadges,
        total: allBadges.length,
        earnedCount: earnedBadges.length
      }
    });
  } catch (error) {
    console.error('Error fetching user badges:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user badges' });
  }
});

// POST /api/gamification/streak/update - Update user streak
router.post('/streak/update', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    const today = new Date().toISOString().split('T')[0];
    
    const existing = await db.get(
      'SELECT * FROM user_streaks WHERE user_id = ?',
      [userId]
    );

    let currentStreak = 1;
    let longestStreak = 1;
    let streakStartDate = today;

    if (existing) {
      const lastDate = existing.last_activity_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate === today) {
        // Already logged today, no change
        return res.json({
          success: true,
          data: {
            currentStreak: existing.current_streak,
            longestStreak: existing.longest_streak
          }
        });
      } else if (lastDate === yesterdayStr) {
        // Consecutive day
        currentStreak = existing.current_streak + 1;
        longestStreak = Math.max(currentStreak, existing.longest_streak);
        streakStartDate = existing.streak_start_date;
      } else {
        // Streak broken
        currentStreak = 1;
        longestStreak = existing.longest_streak;
        streakStartDate = today;
      }

      await db.run(
        `UPDATE user_streaks 
         SET current_streak = ?, longest_streak = ?, last_activity_date = ?, streak_start_date = ?, updated_at = ?
         WHERE user_id = ?`,
        [currentStreak, longestStreak, today, streakStartDate, new Date().toISOString(), userId]
      );
    } else {
      await db.run(
        `INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date, streak_start_date)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, currentStreak, longestStreak, today, streakStartDate]
      );
    }

    // Award daily login points
    await db.run(
      `INSERT INTO user_points (id, user_id, points, reason, activity_type)
       VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), userId, POINTS_CONFIG.daily_login, 'Täglicher Login', 'participation']
    );

    // Check for streak badges
    await checkStreakBadges(userId, currentStreak);

    res.json({
      success: true,
      data: { currentStreak, longestStreak }
    });
  } catch (error) {
    console.error('Error updating streak:', error);
    res.status(500).json({ success: false, error: 'Failed to update streak' });
  }
});

// GET /api/gamification/streak/:userId - Get user streak
router.get('/streak/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const streak = await db.get(
      'SELECT * FROM user_streaks WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      data: streak || {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null
      }
    });
  } catch (error) {
    console.error('Error fetching streak:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch streak' });
  }
});

// Helper function to check badge achievements
async function checkBadgeAchievements(userId) {
  try {
    const badges = await db.all('SELECT * FROM badge_definitions');
    
    for (const badge of badges) {
      const criteria = JSON.parse(badge.criteria);
      const alreadyEarned = await db.get(
        'SELECT * FROM user_badges WHERE user_id = ? AND badge_id = ?',
        [userId, badge.id]
      );

      if (alreadyEarned) continue;

      let earned = false;

      switch (criteria.type) {
        case 'quiz_count':
          const quizCount = await db.get(
            'SELECT COUNT(DISTINCT submodule_id) as count FROM quiz_analytics WHERE user_id = ?',
            [userId]
          );
          earned = quizCount.count >= criteria.count;
          break;

        case 'quiz_score':
          const perfectScore = await db.get(
            'SELECT COUNT(*) as count FROM quiz_analytics WHERE user_id = ? AND (score / max_score) * 100 >= ?',
            [userId, criteria.score]
          );
          earned = perfectScore.count > 0;
          break;

        case 'interaction_count':
          const interactionCount = await db.get(
            'SELECT COUNT(*) as count FROM interaction_analytics WHERE user_id = ?',
            [userId]
          );
          earned = interactionCount.count >= criteria.count;
          break;

        case 'module_completion':
          const moduleCount = await db.get(
            'SELECT COUNT(*) as count FROM participant_progress WHERE user_id = ? AND completion_percentage = 100',
            [userId]
          );
          earned = moduleCount.count >= criteria.count;
          break;
      }

      if (earned) {
        await db.run(
          'INSERT INTO user_badges (id, user_id, badge_id) VALUES (?, ?, ?)',
          [uuidv4(), userId, badge.id]
        );
      }
    }
  } catch (error) {
    console.error('Error checking badge achievements:', error);
  }
}

// Helper function to check streak badges
async function checkStreakBadges(userId, currentStreak) {
  try {
    const streakBadges = await db.all(
      'SELECT * FROM badge_definitions WHERE category = ?',
      ['streak']
    );

    for (const badge of streakBadges) {
      const criteria = JSON.parse(badge.criteria);
      
      if (criteria.type === 'streak' && currentStreak >= criteria.days) {
        const alreadyEarned = await db.get(
          'SELECT * FROM user_badges WHERE user_id = ? AND badge_id = ?',
          [userId, badge.id]
        );

        if (!alreadyEarned) {
          await db.run(
            'INSERT INTO user_badges (id, user_id, badge_id) VALUES (?, ?, ?)',
            [uuidv4(), userId, badge.id]
          );
        }
      }
    }
  } catch (error) {
    console.error('Error checking streak badges:', error);
  }
}

module.exports = router;
