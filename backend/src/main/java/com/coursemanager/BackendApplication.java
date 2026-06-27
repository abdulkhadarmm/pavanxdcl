package com.coursemanager;

import com.coursemanager.entity.Admin;
import com.coursemanager.entity.Session;
import com.coursemanager.repository.AdminRepository;
import com.coursemanager.repository.SessionRepository;
import com.coursemanager.util.PasswordHasher;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import java.util.List;

@SpringBootApplication
public class BackendApplication extends SpringBootServletInitializer {

	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
		return application.sources(BackendApplication.class);
	}

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner initAdminUser(AdminRepository adminRepository, SessionRepository sessionRepository) {
		return args -> {
			if (adminRepository.count() == 0) {
				String defaultEmail = "admin@gmail.com";
				String defaultPass = PasswordHasher.hash("admin@123");
				Admin defaultAdmin = new Admin(defaultEmail, defaultPass);
				adminRepository.save(defaultAdmin);
				System.out.println("Default Admin user seeded: admin@gmail.com / admin@123");
			}

			// Initialize null updatedAt fields for existing database rows
			List<Session> sessions = sessionRepository.findAll();
			boolean updatedAny = false;
			for (Session s : sessions) {
				if (s.getUpdatedAt() == null) {
					s.setUpdatedAt(java.time.LocalDateTime.now().minusHours(1)); // set to 1 hour ago
					sessionRepository.save(s);
					updatedAny = true;
				}
			}
			if (updatedAny) {
				System.out.println("Initialized null updatedAt timestamps for existing sessions.");
			}
		};
	}
}
