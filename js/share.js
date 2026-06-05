/**
 * EduQuiz — Share Module
 * Generates score card images using Canvas API and provides
 * social sharing functionality (WhatsApp, Telegram, Clipboard).
 */

const Share = (() => {
    /**
     * Load an image from a URL safely with CORS.
     */
    function loadImage(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = src;
        });
    }

    /**
     * Generate a beautiful score card image on canvas.
     * Returns a data URL.
     */
    async function generateScoreCard(result) {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        const subjectMeta = UIUtils.getSubjectMeta(result.subject);

        // Background gradient
        const grad = ctx.createLinearGradient(0, 0, 600, 400);
        grad.addColorStop(0, '#0a0a1a');
        grad.addColorStop(0.5, '#1a1a3e');
        grad.addColorStop(1, '#12122a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 600, 400);

        // Decorative circles
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = '#6c5ce7';
        ctx.beginPath();
        ctx.arc(500, 50, 120, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00cec9';
        ctx.beginPath();
        ctx.arc(100, 350, 100, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Border
        ctx.strokeStyle = 'rgba(108, 92, 231, 0.3)';
        ctx.lineWidth = 2;
        ctx.roundRect(10, 10, 580, 380, 16);
        ctx.stroke();

        // Logo
        ctx.font = '600 22px "Outfit", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(' EduQuiz', 300, 50);

        // Subject & Class
        ctx.font = '500 16px "Inter", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillText(
            `Class ${result.classNum} • ${subjectMeta.name}`,
            300,
            78
        );

        // Divider
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(100, 95);
        ctx.lineTo(500, 95);
        ctx.stroke();

        // Username and Avatar
        const profile = Storage.getProfile();
        ctx.save();
        ctx.font = '700 28px "Outfit", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'middle';

        const username = profile.username || 'Student';
        const isUrlAvatar = profile.avatar && profile.avatar.startsWith('http');

        if (isUrlAvatar) {
            const img = await loadImage(profile.avatar);
            if (img) {
                const textWidth = ctx.measureText(username).width;
                const avatarRadius = 18;
                const gap = 10;
                const totalW = avatarRadius * 2 + gap + textWidth;
                const startX = 300 - totalW / 2;

                // Draw circular avatar
                ctx.save();
                ctx.beginPath();
                ctx.arc(startX + avatarRadius, 130, avatarRadius, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(
                    img,
                    startX,
                    130 - avatarRadius,
                    avatarRadius * 2,
                    avatarRadius * 2
                );
                ctx.restore();

                // Draw username text
                ctx.textAlign = 'left';
                ctx.fillText(username, startX + avatarRadius * 2 + gap, 130);
            } else {
                // Fallback to default user emoji if image fails to load
                ctx.textAlign = 'center';
                ctx.fillText(`👤 ${username}`, 300, 130);
            }
        } else {
            // Normal emoji or letter avatar
            ctx.textAlign = 'center';
            ctx.fillText(
                `${profile.avatar || '👤'} ${username}`,
                300,
                130
            );
        }
        ctx.restore();

        // Score circle area
        const scoreColor = result.percentage >= 80
            ? '#00b894'
            : result.percentage >= 50
                ? '#fdcb6e'
                : '#ff6b6b';

        // Score percentage
        ctx.font = '900 64px "Outfit", sans-serif';
        ctx.fillStyle = scoreColor;
        ctx.fillText(`${result.percentage}%`, 300, 220);

        ctx.font = '500 14px "Inter", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText('Score', 300, 242);

        // Stats row
        const statsY = 290;
        const stats = [
            { label: 'Correct', value: result.correct, color: '#55efc4' },
            { label: 'Wrong', value: result.wrong, color: '#ff6b6b' },
            { label: 'Skipped', value: result.skipped, color: '#fdcb6e' },
            { label: 'Total', value: result.total, color: '#a29bfe' },
        ];

        stats.forEach((stat, i) => {
            const x = 100 + i * 120;

            // Stat value
            ctx.font = '800 28px "Outfit", sans-serif';
            ctx.fillStyle = stat.color;
            ctx.fillText(stat.value.toString(), x, statsY);

            // Stat label
            ctx.font = '500 12px "Inter", sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillText(stat.label, x, statsY + 20);
        });

        // Bottom text
        ctx.font = '400 12px "Inter", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillText('Practice quizzes at eduquiz.app', 300, 375);

        return canvas.toDataURL('image/png');
    }

    /**
     * Create share text message.
     */
    function getShareText(result) {
        const profile = Storage.getProfile();
        const subjectMeta = UIUtils.getSubjectMeta(result.subject);
        const name = profile.username || 'I';

        return ` ${name} scored ${result.correct}/${result.total} (${result.percentage}%) in Class ${result.classNum} ${subjectMeta.name} Quiz on EduQuiz! \n\nCan you beat this score? Try now! Pro`;
    }

    /**
     * Copy score text to clipboard.
     */
    async function copyToClipboard(result) {
        const text = getShareText(result);
        try {
            await navigator.clipboard.writeText(text);
            UIUtils.showToast('Score copied to clipboard!', 'success');
        } catch {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            UIUtils.showToast('Score copied to clipboard!', 'success');
        }
    }

    /**
     * Download score card as image.
     */
    async function downloadScoreCard(result) {
        UIUtils.showToast('Generating score card...', 'info', 2000);
        const dataUrl = await generateScoreCard(result);
        const link = document.createElement('a');
        link.download = `EduQuiz_Score_Class${result.classNum}_${result.subject}.png`;
        link.href = dataUrl;
        link.click();
        UIUtils.showToast('Score card downloaded!', 'success');
    }

    // ── Public API ──
    return {
        generateScoreCard,
        getShareText,
        copyToClipboard,
        downloadScoreCard,
    };
})();
