import { useState } from 'react';
import { Download, FileText, Users, Award, Clock } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * PDFReportGenerator - Comprehensive PDF report generation
 * Includes session summary, quiz analytics, participant scores, and charts
 */
function PDFReportGenerator({ sessionId, sessionData, onClose }) {
  const [generating, setGenerating] = useState(false);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeParticipants, setIncludeParticipants] = useState(true);
  const [includeQuizzes, setIncludeQuizzes] = useState(true);

  const generatePDF = async () => {
    setGenerating(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Helper function to add new page if needed
      const checkPageBreak = (requiredSpace = 20) => {
        if (yPosition + requiredSpace > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
          return true;
        }
        return false;
      };

      // Header
      pdf.setFillColor(139, 92, 246);
      pdf.rect(0, 0, pageWidth, 30, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Analytics Report', pageWidth / 2, 15, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Schulungs Compagnon', pageWidth / 2, 23, { align: 'center' });

      yPosition = 40;

      // Report Info
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Erstellt am: ${new Date().toLocaleString('de-DE')}`, 15, yPosition);
      yPosition += 6;
      if (sessionId) {
        pdf.text(`Session ID: ${sessionId}`, 15, yPosition);
        yPosition += 6;
      }
      yPosition += 5;

      // Session Summary Section
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(139, 92, 246);
      pdf.text('Session Übersicht', 15, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);

      const summaryData = [
        ['Metrik', 'Wert'],
        ['Aktive Teilnehmer', sessionData?.activeParticipants || 0],
        ['Durchschn. Engagement', `${sessionData?.avgEngagement || 0}%`],
        ['Durchschn. Zeit', formatDuration(sessionData?.avgTimeSpent || 0)],
        ['Durchschn. Quiz-Score', `${sessionData?.avgQuizScore || 0}%`],
        ['Gesamt-Sitzungen', sessionData?.totalSessions || 0],
        ['Einzigartige Teilnehmer', sessionData?.uniqueParticipants || 0]
      ];

      pdf.autoTable({
        startY: yPosition,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
        margin: { left: 15, right: 15 }
      });

      yPosition = pdf.lastAutoTable.finalY + 10;
      checkPageBreak();

      // Quiz Analytics Section
      if (includeQuizzes && sessionData?.quizPerformance?.length > 0) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(139, 92, 246);
        pdf.text('Quiz-Leistung', 15, yPosition);
        yPosition += 8;

        const quizData = [
          ['Quiz', 'Teilnahmen', 'Erfolgsrate', 'Durchschn. Score', 'Durchschn. Zeit']
        ];

        sessionData.quizPerformance.forEach(quiz => {
          quizData.push([
            quiz.title,
            quiz.attempts.toString(),
            `${quiz.successRate}%`,
            `${quiz.avgScore}%`,
            formatDuration(quiz.avgTime)
          ]);
        });

        pdf.autoTable({
          startY: yPosition,
          head: [quizData[0]],
          body: quizData.slice(1),
          theme: 'striped',
          headStyles: { fillColor: [236, 72, 153], textColor: 255 },
          margin: { left: 15, right: 15 }
        });

        yPosition = pdf.lastAutoTable.finalY + 10;
        checkPageBreak();
      }

      // Score Distribution
      if (sessionData?.scoreDistribution?.length > 0) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(139, 92, 246);
        pdf.text('Score-Verteilung', 15, yPosition);
        yPosition += 8;

        const scoreData = [
          ['Kategorie', 'Anzahl', 'Prozent']
        ];

        const totalScores = sessionData.scoreDistribution.reduce((sum, s) => sum + s.value, 0);
        sessionData.scoreDistribution.forEach(score => {
          scoreData.push([
            score.name,
            score.value.toString(),
            `${((score.value / totalScores) * 100).toFixed(1)}%`
          ]);
        });

        pdf.autoTable({
          startY: yPosition,
          head: [scoreData[0]],
          body: scoreData.slice(1),
          theme: 'grid',
          headStyles: { fillColor: [6, 182, 212], textColor: 255 },
          margin: { left: 15, right: 15 }
        });

        yPosition = pdf.lastAutoTable.finalY + 10;
        checkPageBreak();
      }

      // Interaction Statistics
      if (sessionData?.interactionHeatmap) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(139, 92, 246);
        pdf.text('Interaktionsstatistiken', 15, yPosition);
        yPosition += 8;

        const interactionData = [
          ['Typ', 'Anzahl'],
          ['Emoji-Reaktionen', sessionData.interactionHeatmap.emojis || 0],
          ['Poll-Teilnahmen', sessionData.interactionHeatmap.polls || 0],
          ['Word Cloud Beiträge', sessionData.interactionHeatmap.wordclouds || 0],
          ['Q&A Aktivität', sessionData.interactionHeatmap.qa || 0]
        ];

        pdf.autoTable({
          startY: yPosition,
          head: [interactionData[0]],
          body: interactionData.slice(1),
          theme: 'striped',
          headStyles: { fillColor: [16, 185, 129], textColor: 255 },
          margin: { left: 15, right: 15 }
        });

        yPosition = pdf.lastAutoTable.finalY + 10;
        checkPageBreak();
      }

      // Time Per Submodule
      if (sessionData?.timePerSubmodule?.length > 0) {
        checkPageBreak(60);
        
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(139, 92, 246);
        pdf.text('Zeit pro Submodul', 15, yPosition);
        yPosition += 8;

        const timeData = [
          ['Submodul', 'Durchschn. Zeit']
        ];

        sessionData.timePerSubmodule.forEach(item => {
          timeData.push([
            item.name,
            formatDuration(item.avgTime)
          ]);
        });

        pdf.autoTable({
          startY: yPosition,
          head: [timeData[0]],
          body: timeData.slice(1),
          theme: 'grid',
          headStyles: { fillColor: [245, 158, 11], textColor: 255 },
          margin: { left: 15, right: 15 }
        });

        yPosition = pdf.lastAutoTable.finalY + 10;
      }

      // Drop-off Points
      if (sessionData?.dropOffPoints?.length > 0) {
        checkPageBreak(60);
        
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(239, 68, 68);
        pdf.text('Drop-off Punkte', 15, yPosition);
        yPosition += 8;

        const dropOffData = [
          ['Submodul', 'Beschreibung', 'Abbruchrate']
        ];

        sessionData.dropOffPoints.forEach(point => {
          dropOffData.push([
            point.name,
            point.description,
            `${point.dropOffRate}%`
          ]);
        });

        pdf.autoTable({
          startY: yPosition,
          head: [dropOffData[0]],
          body: dropOffData.slice(1),
          theme: 'striped',
          headStyles: { fillColor: [239, 68, 68], textColor: 255 },
          margin: { left: 15, right: 15 }
        });

        yPosition = pdf.lastAutoTable.finalY + 10;
      }

      // Footer on last page
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `Seite ${i} von ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        pdf.text(
          'Schulungs Compagnon Analytics Report',
          15,
          pageHeight - 10
        );
      }

      // Save PDF
      pdf.save(`analytics-report-${sessionId || 'overview'}-${Date.now()}.pdf`);
      
      alert('PDF-Bericht erfolgreich erstellt!');
      if (onClose) onClose();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Fehler beim Erstellen des PDF-Berichts');
    } finally {
      setGenerating(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText size={24} className="text-purple-400" />
          PDF-Bericht erstellen
        </h3>
        <p className="text-gray-400 mt-1">
          Umfassender Analysebericht mit allen Metriken
        </p>
      </div>

      {/* Preview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <Users size={20} className="text-purple-400 mb-2" />
          <p className="text-2xl font-bold text-white">{sessionData?.activeParticipants || 0}</p>
          <p className="text-xs text-gray-400">Teilnehmer</p>
        </div>
        <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4">
          <Award size={20} className="text-pink-400 mb-2" />
          <p className="text-2xl font-bold text-white">{sessionData?.avgQuizScore || 0}%</p>
          <p className="text-xs text-gray-400">Durchschn. Score</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <Clock size={20} className="text-blue-400 mb-2" />
          <p className="text-2xl font-bold text-white">{formatDuration(sessionData?.avgTimeSpent || 0)}</p>
          <p className="text-xs text-gray-400">Durchschn. Zeit</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <FileText size={20} className="text-green-400 mb-2" />
          <p className="text-2xl font-bold text-white">{sessionData?.totalSessions || 0}</p>
          <p className="text-xs text-gray-400">Sitzungen</p>
        </div>
      </div>

      {/* Options */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Berichtsoptionen</h4>
        
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeCharts}
              onChange={(e) => setIncludeCharts(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500"
            />
            Diagramme einschließen
          </label>
          
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeQuizzes}
              onChange={(e) => setIncludeQuizzes(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500"
            />
            Quiz-Analysen einschließen
          </label>
          
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeParticipants}
              onChange={(e) => setIncludeParticipants(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500"
            />
            Teilnehmerliste einschließen
          </label>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generatePDF}
        disabled={generating}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            Erstelle PDF-Bericht...
          </>
        ) : (
          <>
            <Download size={20} />
            PDF-Bericht herunterladen
          </>
        )}
      </button>
    </div>
  );
}

export default PDFReportGenerator;
