CREATE TABLE IF NOT EXISTS alternatives (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS criteria (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	type ENUM('maximize', 'minimize') NOT NULL,
	weight DECIMAL(12,6) NOT NULL DEFAULT 0,
	description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS evaluations (
	id INT AUTO_INCREMENT PRIMARY KEY,
	alternative_id INT NOT NULL,
	criterion_id INT NOT NULL,
	score DECIMAL(12,6) NOT NULL,
	UNIQUE KEY unique_evaluation (alternative_id, criterion_id),
	CONSTRAINT fk_evaluations_alternative
		FOREIGN KEY (alternative_id) REFERENCES alternatives(id)
		ON DELETE CASCADE,
	CONSTRAINT fk_evaluations_criterion
		FOREIGN KEY (criterion_id) REFERENCES criteria(id)
		ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS votes (
	id INT AUTO_INCREMENT PRIMARY KEY,
	voter_id INT NOT NULL,
	criterion_id INT NOT NULL,
	rank INT NOT NULL,
	UNIQUE KEY unique_vote (voter_id, criterion_id),
	CONSTRAINT fk_votes_criterion
		FOREIGN KEY (criterion_id) REFERENCES criteria(id)
		ON DELETE CASCADE
);