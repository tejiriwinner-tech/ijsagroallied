<?php
// Email configuration for SMTP
// You can use Gmail, Outlook, or any SMTP provider

class EmailConfig
{
    // Gmail SMTP settings (recommended for testing)
    const SMTP_HOST = 'smtp.gmail.com';
    const SMTP_PORT = 587;
    const SMTP_SECURE = 'tls'; // or 'ssl' for port 465

    // Email credentials - UPDATE THESE WITH YOUR EMAIL
    const SMTP_USERNAME = 'your-email@gmail.com'; // Your Gmail address
    const SMTP_PASSWORD = 'your-app-password';    // Your Gmail App Password (not regular password)

    // From email settings
    const FROM_EMAIL = 'noreply@mvagriculturalconsult.com';
    const FROM_NAME = 'MV Agricultural Consult';

    // Alternative SMTP providers (uncomment to use)

    // Outlook/Hotmail SMTP
    // const SMTP_HOST = 'smtp-mail.outlook.com';
    // const SMTP_PORT = 587;
    // const SMTP_SECURE = 'tls';

    // Yahoo SMTP
    // const SMTP_HOST = 'smtp.mail.yahoo.com';
    // const SMTP_PORT = 587;
    // const SMTP_SECURE = 'tls';

    // Custom SMTP (your hosting provider)
    // const SMTP_HOST = 'mail.yourdomain.com';
    // const SMTP_PORT = 587;
    // const SMTP_SECURE = 'tls';
}

// Email sending function using PHPMailer
function sendEmail($to, $subject, $htmlBody, $textBody = '')
{
    // Check if PHPMailer is available
    if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
        // Fallback to simple mail() function
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: " . EmailConfig::FROM_NAME . " <" . EmailConfig::FROM_EMAIL . ">" . "\r\n";

        return mail($to, $subject, $htmlBody, $headers);
    }

    try {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);

        // Server settings
        $mail->isSMTP();
        $mail->Host = EmailConfig::SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = EmailConfig::SMTP_USERNAME;
        $mail->Password = EmailConfig::SMTP_PASSWORD;
        $mail->SMTPSecure = EmailConfig::SMTP_SECURE;
        $mail->Port = EmailConfig::SMTP_PORT;

        // Recipients
        $mail->setFrom(EmailConfig::FROM_EMAIL, EmailConfig::FROM_NAME);
        $mail->addAddress($to);

        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $htmlBody;
        if ($textBody) {
            $mail->AltBody = $textBody;
        }

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Email sending failed: " . $e->getMessage());
        return false;
    }
}
?>