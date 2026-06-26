package com.coursemanager;

import com.coursemanager.entity.Admin;
import com.coursemanager.repository.AdminRepository;
import com.coursemanager.util.PasswordHasher;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;

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
	public CommandLineRunner initAdminUser(AdminRepository adminRepository) {
		return args -> {
			if (adminRepository.count() == 0) {
				String defaultEmail = "admin@gmail.com";
				String defaultPass = PasswordHasher.hash("admin@123");
				Admin defaultAdmin = new Admin(defaultEmail, defaultPass);
				adminRepository.save(defaultAdmin);
				System.out.println("Default Admin user seeded: admin@gmail.com / admin@123");
			}
		};
	}
}
