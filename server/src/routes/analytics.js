const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../services/database');
const jsPDF = require('jspdf');
require('jspdf-autotable');

/**
 * Analytics API Routes
 * Provides session metrics, quiz analytics, interaction tracking, and reports
 */

// GET /api/analytics/overview - Get overall analytics
router.get('/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Get active participants (real-time)
    const activeParticipants = await db.get(
      `SELECT COUNT(DISTINCT user_id) as count 
       FROM submodule_views 
       WHERE viewed_at > datetime('now', '-5 minutes')`
    );

    // Get average engagement
    const engagement = await db.get(
      `SELECT AVG(completed) * 100 as avg_engagement
       FROM submodule_views
       WHERE viewed_at BETWEEN ? AND ?`,
      [startDate, endDate]
    );

    // Get average time spent
    const timeSpent = await db.get(
      `SELECT AVG(time_spent) as avg_time
       FROM submodule_views
       WHERE viewed_at BETWEEN ? AND ?`,
      [startDate, endDate]
    );

    // Get average quiz score
    const quizScore = await db.get(
      `SELECT AVG((score / max_score) * 100) as avg_score
       FROM quiz_analytics
       WHERE submitted_at BETWEEN ? AND ?`,
      [startDate, endDate]
    );

    // Get time per submodule
    const timePerSubmodule = await db.all(
      `SELECT s.title as name, AVG(sv.time_spent) as avgTime
       FROM submodule_views sv
       JOIN submodules s ON sv.submodule_id = s.id
       WHERE sv.viewed_at BETWEEN ? AND ?
       GROUP BY sv.submodule_id
       ORDER BY avgTime DESC
       LIMIT 10`,
      [startDate, endDate]
    );

    // Get drop-off points (submodules with high incomplete rates)
    const dropOffPoints = await db.all(
      `SELECT s.title as name, s.id,
              COUNT(*) as total_views,
              SUM(CASE WHEN sv.completed = 0 THEN 1 ELSE 0 END) as incomplete,
              ROUND((SUM(CASE WHEN sv.completed = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) as dropOffRate
       FROM submodule_views sv
       JOIN submodules s ON sv.submodule_id = s.id
       WHERE sv.viewed_at BETWEEN ? AND ?
       GROUP BY sv.submodule_id
       HAVING dropOffRate > 30
       ORDER BY dropOffRate DESC
       LIMIT 5`,
      [startDate, endDate]
    );

    res.json({
      success: true,
      data: {
        activeParticipants: activeParticipants?.count || 0,
        avgEngagement: Math.round(engagement?.avg_engagement || 0),
        engagementChange: 5, // TODO: Calculate actual change
        avgTimeSpent: Math.round(timeSpent?.avg_time || 0),
        avgQuizScore: Math.round(quizScore?.avg_score || 0),
        timePerSubmodule: timePerSubmodule.map(t => ({
          name: t.name,
          avgTime: Math.round(t.avgTime || 0)
        })),
        dropOffPoints: dropOffPoints.map(d => ({
          name: d.name,
          description: `${d.total_views} Aufrufe, ${d.incomplete} unvollständig`,
          dropOffRate: d.dropOffRate
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching overview analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

// GET /api/analytics/session/:id - Get session-specific analytics
router.get('/session/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const sessionAnalytics = await db.get(
      'SELECT * FROM session_analytics WHERE session_id = ?',
      [id]
    );

    // Get quiz performance for this session
    const quizPerformance = await db.all(
      `SELECT s.title, 
              COUNT(*) as attempts,
              AVG((qa.score / qa.max_score) * 100) as avgScore,
              AVG(qa.time_to_complete) as avgTime,
              SUM(CASE WHEN (qa.score / qa.max_score) >= 0.6 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as successRate
       FROM quiz_analytics qa
       JOIN submodules s ON qa.submodule_id = s.id
       WHERE qa.session_id = ?
       GROUP BY qa.submodule_id`,
      [id]
    );

    // Get score distribution
    const scoreDistribution = await db.all(
      `SELECT 
         CASE 
           WHEN (score / max_score) * 100 >= 90 THEN 'Ausgezeichnet (90-100%)'
           WHEN (score / max_score) * 100 >= 70 THEN 'Gut (70-89%)'
           WHEN (score / max_score) * 100 >= 50 THEN 'Befriedigend (50-69%)'
           ELSE 'Verbesserungsbedarf (<50%)'
         END as name,
         COUNT(*) as value
       FROM quiz_analytics
       WHERE session_id = ?
       GROUP BY name`,
      [id]
    );

    // Get interaction heatmap
    const interactionHeatmap = await db.get(
      `SELECT 
         SUM(CASE WHEN interaction_type = 'emoji' THEN 1 ELSE 0 END) as emojis,
         SUM(CASE WHEN interaction_type = 'poll' THEN 1 ELSE 0 END) as polls,
         SUM(CASE WHEN interaction_type = 'wordcloud' THEN 1 ELSE 0 END) as wordclouds,
         SUM(CASE WHEN interaction_type = 'qa' THEN 1 ELSE 0 END) as qa
       FROM interaction_analytics
       WHERE session_id = ?`,
      [id]
    );

    // Get participation rates
    const participationRates = await db.all(
      `SELECT s.title as name,
              COUNT(DISTINCT ia.user_id) * 100.0 / sa.unique_participants as rate
       FROM interaction_analytics ia
       JOIN submodules s ON ia.submodule_id = s.id
       JOIN session_analytics sa ON ia.session_id = sa.session_id
       WHERE ia.session_id = ?
       GROUP BY ia.submodule_id`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...sessionAnalytics,
        quizPerformance: quizPerformance.map(q => ({
          title: q.title,
          attempts: q.attempts,
          avgScore: Math.round(q.avgScore || 0),
          avgTime: Math.round(q.avgTime || 0),
          successRate: Math.round(q.successRate || 0)
        })),
        scoreDistribution,
        interactionHeatmap,
        participationRates: participationRates.map(p => ({
          name: p.name,
          rate: Math.round(p.rate || 0)
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching session analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch session analytics' });
  }
});

// POST /api/analytics/track/view - Track submodule view
router.post('/track/view', async (req, res) => {
  try {
    const { sessionId, submoduleId, userId, timeSpent, completed } = req.body;

    const viewId = uuidv4();
    await db.run(
      `INSERT INTO submodule_views (id, session_id, submodule_id, user_id, viewed_at, time_spent, completed)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [viewId, sessionId, submoduleId, userId, new Date().toISOString(), timeSpent || 0, completed ? 1 : 0]
    );

    res.json({ success: true, data: { id: viewId } });
  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({ success: false, error: 'Failed to track view' });
  }
});

// POST /api/analytics/track/quiz - Track quiz submission
router.post('/track/quiz', async (req, res) => {
  try {
    const { sessionId, submoduleId, userId, score, maxScore, timeToComplete, answers } = req.body;

    const quizId = uuidv4();
    await db.run(
      `INSERT INTO quiz_analytics (id, session_id, submodule_id, user_id, score, max_score, time_to_complete, answers, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [quizId, sessionId, submoduleId, userId, score, maxScore, timeToComplete, JSON.stringify(answers), new Date().toISOString()]
    );

    res.json({ success: true, data: { id: quizId } });
  } catch (error) {
    console.error('Error tracking quiz:', error);
    res.status(500).json({ success: false, error: 'Failed to track quiz' });
  }
});

// POST /api/analytics/track/interaction - Track interaction
router.post('/track/interaction', async (req, res) => {
  try {
    const { sessionId, submoduleId, userId, interactionType, interactionData } = req.body;

    const interactionId = uuidv4();
    await db.run(
      `INSERT INTO interaction_analytics (id, session_id, submodule_id, user_id, interaction_type, interaction_data, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [interactionId, sessionId, submoduleId, userId, interactionType, JSON.stringify(interactionData), new Date().toISOString()]
    );

    res.json({ success: true, data: { id: interactionId } });
  } catch (error) {
    console.error('Error tracking interaction:', error);
    res.status(500).json({ success: false, error: 'Failed to track interaction' });
  }
});

// GET /api/analytics/participant/:userId/progress - Get participant progress
router.get('/participant/:userId/progress', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get overall stats
    const stats = await db.get(
      `SELECT 
         COUNT(DISTINCT module_id) as modulesCompleted,
         SUM(total_time_spent) as totalTimeSpent,
         AVG(completion_percentage) as avgCompletion
       FROM participant_progress
       WHERE user_id = ?`,
      [userId]
    );

    // Get average quiz score
    const quizStats = await db.get(
      `SELECT AVG((score / max_score) * 100) as avgScore
       FROM quiz_analytics
       WHERE user_id = ?`,
      [userId]
    );

    // Get module progress
    const moduleProgress = await db.all(
      `SELECT m.title, pp.completion_percentage, pp.total_time_spent as timeSpent,
              pp.submodules_completed,
              (SELECT COUNT(*) FROM submodules WHERE module_id = m.id) as totalSubmodules
       FROM participant_progress pp
       JOIN modules m ON pp.module_id = m.id
       WHERE pp.user_id = ?
       ORDER BY pp.last_accessed DESC`,
      [userId]
    );

    // Get quiz history
    const quizHistory = await db.all(
      `SELECT s.title, (qa.score / qa.max_score) * 100 as score, qa.submitted_at
       FROM quiz_analytics qa
       JOIN submodules s ON qa.submodule_id = s.id
       WHERE qa.user_id = ?
       ORDER BY qa.submitted_at DESC
       LIMIT 10`,
      [userId]
    );

    // Get certificates
    const certificates = await db.all(
      `SELECT module_title as moduleTitle, issued_at as issuedAt, verification_code as verificationCode
       FROM certificates
       WHERE user_id = ?
       ORDER BY issued_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        modulesCompleted: stats?.modulesCompleted || 0,
        totalTimeSpent: stats?.totalTimeSpent || 0,
        avgQuizScore: Math.round(quizStats?.avgScore || 0),
        totalPoints: 0, // TODO: Implement points system
        moduleProgress: moduleProgress.map(m => ({
          title: m.title,
          completionPercentage: Math.round(m.completion_percentage || 0),
          timeSpent: m.timeSpent || 0,
          completedSubmodules: m.submodules_completed ? JSON.parse(m.submodules_completed).length : 0,
          totalSubmodules: m.totalSubmodules
        })),
        quizHistory: quizHistory.map(q => ({
          title: q.title,
          score: Math.round(q.score || 0)
        })),
        certificates,
        bookmarks: [], // TODO: Get from IndexedDB
        recentNotes: [], // TODO: Get from IndexedDB
        notesCount: 0,
        achievements: []
      }
    });
  } catch (error) {
    console.error('Error fetching participant progress:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch progress' });
  }
});

// POST /api/analytics/certificate/generate - Generate certificate
router.post('/certificate/generate', async (req, res) => {
  try {
    const { userId, userName, moduleId, moduleTitle, customization } = req.body;

    const certificateId = uuidv4();
    const verificationCode = uuidv4().substring(0, 8).toUpperCase();

    await db.run(
      `INSERT INTO certificates (id, user_id, user_name, module_id, module_title, issued_at, verification_code, certificate_data, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        certificateId,
        userId,
        userName,
        moduleId,
        moduleTitle,
        new Date().toISOString(),
        verificationCode,
        JSON.stringify(customization),
        new Date().toISOString()
      ]
    );

    res.json({
      success: true,
      data: {
        id: certificateId,
        verificationCode
      }
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ success: false, error: 'Failed to generate certificate' });
  }
});

// GET /api/analytics/export/:sessionId - Export analytics report
router.get('/export/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { format = 'pdf' } = req.query;

    if (format === 'csv') {
      // Export as CSV
      const quizData = await db.all(
        `SELECT qa.*, s.title as submodule_title
         FROM quiz_analytics qa
         JOIN submodules s ON qa.submodule_id = s.id
         WHERE qa.session_id = ?`,
        [sessionId]
      );

      const csv = [
        'Submodule,User ID,Score,Max Score,Percentage,Time (s),Submitted At',
        ...quizData.map(q => 
          `"${q.submodule_title}","${q.user_id}",${q.score},${q.max_score},${((q.score/q.max_score)*100).toFixed(2)},${q.time_to_complete},"${q.submitted_at}"`
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${sessionId}.csv`);
      res.send(csv);
    } else {
      // Return data for client-side PDF generation
      const sessionAnalytics = await db.get(
        'SELECT * FROM session_analytics WHERE session_id = ?',
        [sessionId]
      );

      const quizPerformance = await db.all(
        `SELECT s.title, 
                COUNT(*) as attempts,
                AVG((qa.score / qa.max_score) * 100) as avgScore,
                AVG(qa.time_to_complete) as avgTime,
                SUM(CASE WHEN (qa.score / qa.max_score) >= 0.6 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as successRate
         FROM quiz_analytics qa
         JOIN submodules s ON qa.submodule_id = s.id
         WHERE qa.session_id = ?
         GROUP BY qa.submodule_id`,
        [sessionId]
      );

      const scoreDistribution = await db.all(
        `SELECT 
           CASE 
             WHEN (score / max_score) * 100 >= 90 THEN 'Ausgezeichnet (90-100%)'
             WHEN (score / max_score) * 100 >= 70 THEN 'Gut (70-89%)'
             WHEN (score / max_score) * 100 >= 50 THEN 'Befriedigend (50-69%)'
             ELSE 'Verbesserungsbedarf (<50%)'
           END as name,
           COUNT(*) as value
         FROM quiz_analytics
         WHERE session_id = ?
         GROUP BY name`,
        [sessionId]
      );

      const interactionHeatmap = await db.get(
        `SELECT 
           SUM(CASE WHEN interaction_type = 'emoji' THEN 1 ELSE 0 END) as emojis,
           SUM(CASE WHEN interaction_type = 'poll' THEN 1 ELSE 0 END) as polls,
           SUM(CASE WHEN interaction_type = 'wordcloud' THEN 1 ELSE 0 END) as wordclouds,
           SUM(CASE WHEN interaction_type = 'qa' THEN 1 ELSE 0 END) as qa
         FROM interaction_analytics
         WHERE session_id = ?`,
        [sessionId]
      );

      const timePerSubmodule = await db.all(
        `SELECT s.title as name, AVG(sv.time_spent) as avgTime
         FROM submodule_views sv
         JOIN submodules s ON sv.submodule_id = s.id
         WHERE sv.session_id = ?
         GROUP BY sv.submodule_id
         ORDER BY avgTime DESC
         LIMIT 10`,
        [sessionId]
      );

      const dropOffPoints = await db.all(
        `SELECT s.title as name,
                COUNT(*) as total_views,
                SUM(CASE WHEN sv.completed = 0 THEN 1 ELSE 0 END) as incomplete,
                ROUND((SUM(CASE WHEN sv.completed = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) as dropOffRate
         FROM submodule_views sv
         JOIN submodules s ON sv.submodule_id = s.id
         WHERE sv.session_id = ? AND COUNT(*) > 0
         GROUP BY sv.submodule_id
         HAVING dropOffRate > 30
         ORDER BY dropOffRate DESC
         LIMIT 5`,
        [sessionId]
      );

      res.json({
        success: true,
        data: {
          ...sessionAnalytics,
          quizPerformance: quizPerformance.map(q => ({
            title: q.title,
            attempts: q.attempts,
            avgScore: Math.round(q.avgScore || 0),
            avgTime: Math.round(q.avgTime || 0),
            successRate: Math.round(q.successRate || 0)
          })),
          scoreDistribution,
          interactionHeatmap,
          timePerSubmodule: timePerSubmodule.map(t => ({
            name: t.name,
            avgTime: Math.round(t.avgTime || 0)
          })),
          dropOffPoints: dropOffPoints.map(d => ({
            name: d.name,
            description: `${d.total_views} Aufrufe, ${d.incomplete} unvollständig`,
            dropOffRate: d.dropOffRate
          }))
        }
      });
    }
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({ success: false, error: 'Failed to export report' });
  }
});

// GET /api/analytics/participant/:userId/report - Generate individual participant report
router.get('/participant/:userId/report', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get participant progress
    const progress = await db.all(
      `SELECT m.title as moduleTitle, pp.completion_percentage, pp.total_time_spent,
              pp.submodules_completed, pp.quiz_scores
       FROM participant_progress pp
       JOIN modules m ON pp.module_id = m.id
       WHERE pp.user_id = ?
       ORDER BY pp.last_accessed DESC`,
      [userId]
    );

    // Get quiz history
    const quizHistory = await db.all(
      `SELECT s.title, m.title as moduleTitle, 
              (qa.score / qa.max_score) * 100 as score,
              qa.submitted_at
       FROM quiz_analytics qa
       JOIN submodules s ON qa.submodule_id = s.id
       JOIN modules m ON s.module_id = m.id
       WHERE qa.user_id = ?
       ORDER BY qa.submitted_at DESC`,
      [userId]
    );

    // Get certificates
    const certificates = await db.all(
      `SELECT module_title, issued_at, verification_code
       FROM certificates
       WHERE user_id = ?
       ORDER BY issued_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        userId,
        progress,
        quizHistory,
        certificates,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating participant report:', error);
    res.status(500).json({ success: false, error: 'Failed to generate participant report' });
  }
});

// POST /api/analytics/compare - Compare multiple sessions
router.post('/compare', async (req, res) => {
  try {
    const { sessionIds } = req.body;

    if (!sessionIds || sessionIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 session IDs required for comparison'
      });
    }

    const comparisons = [];

    for (const sessionId of sessionIds) {
      const sessionData = await db.get(
        'SELECT * FROM session_analytics WHERE session_id = ?',
        [sessionId]
      );

      const avgQuizScore = await db.get(
        `SELECT AVG((score / max_score) * 100) as avgScore
         FROM quiz_analytics
         WHERE session_id = ?`,
        [sessionId]
      );

      const avgEngagement = await db.get(
        `SELECT AVG(completed) * 100 as avgEngagement
         FROM submodule_views
         WHERE session_id = ?`,
        [sessionId]
      );

      const totalInteractions = await db.get(
        `SELECT COUNT(*) as total
         FROM interaction_analytics
         WHERE session_id = ?`,
        [sessionId]
      );

      comparisons.push({
        sessionId,
        totalParticipants: sessionData?.total_participants || 0,
        uniqueParticipants: sessionData?.unique_participants || 0,
        avgQuizScore: Math.round(avgQuizScore?.avgScore || 0),
        avgEngagement: Math.round(avgEngagement?.avgEngagement || 0),
        totalInteractions: totalInteractions?.total || 0,
        duration: sessionData?.total_duration || 0,
        startedAt: sessionData?.started_at
      });
    }

    // Calculate comparative metrics
    const avgParticipants = comparisons.reduce((sum, c) => sum + c.totalParticipants, 0) / comparisons.length;
    const avgScore = comparisons.reduce((sum, c) => sum + c.avgQuizScore, 0) / comparisons.length;
    const avgEngagementRate = comparisons.reduce((sum, c) => sum + c.avgEngagement, 0) / comparisons.length;

    res.json({
      success: true,
      data: {
        sessions: comparisons,
        summary: {
          avgParticipants: Math.round(avgParticipants),
          avgScore: Math.round(avgScore),
          avgEngagement: Math.round(avgEngagementRate),
          totalSessions: comparisons.length,
          bestSession: comparisons.reduce((best, current) => 
            current.avgQuizScore > best.avgQuizScore ? current : best
          ),
          mostEngaged: comparisons.reduce((best, current) => 
            current.avgEngagement > best.avgEngagement ? current : best
          )
        }
      }
    });
  } catch (error) {
    console.error('Error comparing sessions:', error);
    res.status(500).json({ success: false, error: 'Failed to compare sessions' });
  }
});

module.exports = router;
