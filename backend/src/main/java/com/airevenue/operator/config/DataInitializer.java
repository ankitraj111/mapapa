package com.airevenue.operator.config;

import com.airevenue.operator.domain.enums.AppointmentStatus;
import com.airevenue.operator.domain.enums.LeadStatus;
import com.airevenue.operator.domain.enums.UserRole;
import com.airevenue.operator.domain.model.*;
import com.airevenue.operator.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Component
@Profile("!prod")
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final TenantRepository tenantRepo;
    private final UserRepository userRepo;
    private final MembershipRepository membershipRepo;
    private final KnowledgeDocumentRepository knowledgeRepo;
    private final LeadRepository leadRepo;
    private final AppointmentRepository appointmentRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking initial demo seed data for AI Revenue Operator...");

        Tenant tenant = tenantRepo.findBySlug("tech-agency").orElseGet(() -> {
            log.info("Creating default demo tenant: tech-agency");
            return tenantRepo.save(Tenant.builder()
                .name("Apex Growth Digital Agency")
                .slug("tech-agency")
                .industry("B2B SaaS & Digital Services")
                .website("https://apexgrowth.agency")
                .email("contact@apexgrowth.agency")
                .phone("+1 800-555-0199")
                .timezone("America/New_York")
                .currency("USD")
                .plan("PROFESSIONAL")
                .subscriptionStatus("ACTIVE")
                .monthlyLeadLimit(500)
                .monthlyAiActionLimit(5000)
                .aiTone("Professional, consultative, value-driven, ROI-focused")
                .followUpEnabled(true)
                .isActive(true)
                .build());
        });

        User admin = userRepo.findByEmail("admin@techagency.com").orElseGet(() -> {
            log.info("Creating default demo admin: admin@techagency.com");
            return userRepo.save(User.builder()
                .email("admin@techagency.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .firstName("Alex")
                .lastName("Morgan")
                .phone("+1 555-0100")
                .isEmailVerified(true)
                .isActive(true)
                .build());
        });

        if (!membershipRepo.existsByTenantIdAndUserId(tenant.getId(), admin.getId())) {
            membershipRepo.save(Membership.builder()
                .tenant(tenant)
                .user(admin)
                .role(UserRole.OWNER)
                .isActive(true)
                .build());
        }

        // Seed Knowledge Base if empty
        if (knowledgeRepo.findByTenantIdAndIsActiveTrue(tenant.getId()).isEmpty()) {
            log.info("Seeding initial AI knowledge documents for tenant {}", tenant.getSlug());
            knowledgeRepo.save(KnowledgeDocument.builder()
                .tenantId(tenant.getId())
                .title("Core Services & Offerings")
                .category("SERVICES")
                .content("""
                    Apex Growth Digital Agency specializes in:
                    1. Custom AI Sales Employees & Revenue Operations Automation ($15,000 - $45,000)
                    2. Full-Stack Cloud Web Application Development ($25,000 - $80,000)
                    3. B2B Inbound Lead Funnel Architecture & HubSpot/Salesforce Integration ($10,000 - $25,000)
                    Typical delivery timeline is 4 to 8 weeks depending on scope.
                    """)
                .isActive(true)
                .build());

            knowledgeRepo.save(KnowledgeDocument.builder()
                .tenantId(tenant.getId())
                .title("Pricing & Engagement Models")
                .category("PRICING")
                .content("""
                    Engagement Models:
                    - Fixed Price Sprint: Milestone-based payments (50% upfront, 50% upon delivery).
                    - Monthly Dedicated Engineering Retainer: $8,500/month per senior engineer.
                    - Minimum project budget accepted: $10,000.
                    """)
                .isActive(true)
                .build());
        }

        // Seed Sample Pipeline Leads if empty
        if (leadRepo.findByTenantId(tenant.getId(), org.springframework.data.domain.Pageable.ofSize(1)).isEmpty()) {
            log.info("Seeding demo pipeline leads for tenant {}", tenant.getSlug());

            Lead hotLead = leadRepo.save(Lead.builder()
                .tenantId(tenant.getId())
                .firstName("Sarah")
                .lastName("Jenkins")
                .email("sjenkins@globalretail.io")
                .phone("+1 555-0144")
                .company("Global Retail Corp")
                .source("WEBSITE_LEAD")
                .requirement("Urgent need for multi-channel AI Sales Agent with WhatsApp & Calendar integration.")
                .estimatedBudget(BigDecimal.valueOf(35000))
                .timeline("1 month")
                .intent("High Purchase Intent")
                .score(95)
                .status(LeadStatus.HOT)
                .build());

            Lead bookedLead = leadRepo.save(Lead.builder()
                .tenantId(tenant.getId())
                .firstName("David")
                .lastName("Chen")
                .email("david@saastech.io")
                .phone("+1 555-0188")
                .company("SaaS Tech Cloud")
                .source("GMAIL")
                .requirement("Interested in replacing manual SDR team with 24/7 AI Revenue Operator.")
                .estimatedBudget(BigDecimal.valueOf(25000))
                .timeline("2 months")
                .score(85)
                .status(LeadStatus.MEETING_BOOKED)
                .build());

            leadRepo.save(Lead.builder()
                .tenantId(tenant.getId())
                .firstName("Elena")
                .lastName("Rostova")
                .email("elena@healthpulse.com")
                .phone("+1 555-0192")
                .company("HealthPulse AI")
                .source("WHATSAPP")
                .requirement("HIPAA compliant appointment scheduling and prospect qualification.")
                .estimatedBudget(BigDecimal.valueOf(18000))
                .timeline("3 months")
                .score(70)
                .status(LeadStatus.QUALIFIED)
                .build());

            leadRepo.save(Lead.builder()
                .tenantId(tenant.getId())
                .firstName("Marcus")
                .lastName("Vance")
                .email("marcus@fintechalpha.co")
                .phone("+1 555-0122")
                .company("Fintech Alpha")
                .source("WEBSITE_LEAD")
                .requirement("Exploring options for lead automation.")
                .estimatedBudget(BigDecimal.valueOf(8000))
                .timeline("Flexible")
                .score(45)
                .status(LeadStatus.QUALIFYING)
                .build());

            // Seed Sample Appointment
            appointmentRepo.save(Appointment.builder()
                .tenantId(tenant.getId())
                .lead(bookedLead)
                .title("Apex Growth <> SaaS Tech AI Sales Consultation")
                .description("Demo of AI Revenue Operator qualification and autonomous booking.")
                .startTime(ZonedDateTime.now().plusDays(2).withHour(14).withMinute(0).withSecond(0))
                .endTime(ZonedDateTime.now().plusDays(2).withHour(14).withMinute(45).withSecond(0))
                .timezone("America/New_York")
                .meetingLink("https://meet.google.com/abc-demo-xyz")
                .status(AppointmentStatus.CONFIRMED)
                .build());
        }

        log.info("AI Revenue Operator seed initialization completed successfully.");
    }
}
