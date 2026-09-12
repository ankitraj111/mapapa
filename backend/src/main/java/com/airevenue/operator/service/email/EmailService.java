package com.airevenue.operator.service.email;

import com.airevenue.operator.domain.model.Appointment;
import com.airevenue.operator.domain.model.Lead;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@airevenue.app}")
    private String fromEmail;

    @Value("${app.name:AI Revenue Operator}")
    private String appName;

    public void sendFollowUp(Lead lead, String messageTemplate) {
        String content = messageTemplate
            .replace("{{lead_first_name}}", lead.getFirstName())
            .replace("{{requirement}}", Optional.ofNullable(lead.getRequirement()).orElse("your project"));
        sendEmail(lead.getEmail(), "Following up on your inquiry", content);
    }

    public void sendAIResponse(String toEmail, String subject, String content) {
        sendEmail(toEmail, subject, content);
    }

    public void sendMeetingConfirmation(Lead lead, Appointment apt) {
        String subject = "Meeting Confirmed: " + apt.getTitle();
        String body = String.format(
            "Hi %s,\n\nYour meeting has been confirmed!\n\n" +
            "Title: %s\nTime: %s\n%s\n\nLooking forward to speaking with you!\n\n%s Team",
            lead.getFirstName(), apt.getTitle(), apt.getStartTime(),
            apt.getMeetingLink() != null ? "Meeting Link: " + apt.getMeetingLink() : "",
            appName);
        sendEmail(lead.getEmail(), subject, body);
    }

    public void sendHumanHandoffAlert(String toEmail, Lead lead, String reason) {
        String subject = "Action Required: Lead needs your attention - " + lead.getFirstName() + " " + Optional.ofNullable(lead.getLastName()).orElse("");
        String body = String.format(
            "Hi,\n\nA lead requires your personal attention.\n\n" +
            "Lead: %s %s\nEmail: %s\nCompany: %s\nRequirement: %s\n\nReason: %s\n\n" +
            "Please log in to AI Revenue Operator to handle this lead.",
            lead.getFirstName(), Optional.ofNullable(lead.getLastName()).orElse(""),
            lead.getEmail(), Optional.ofNullable(lead.getCompany()).orElse("N/A"),
            Optional.ofNullable(lead.getRequirement()).orElse("Not specified"), reason);
        sendEmail(toEmail, subject, body);
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromEmail, appName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, false);
            mailSender.send(message);
            log.info("Email sent to {}: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
