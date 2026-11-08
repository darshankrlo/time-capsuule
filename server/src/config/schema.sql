CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS capsules (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  mongo_letter_id VARCHAR(24) NOT NULL,
  unlock_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'locked' CHECK (status IN ('locked','unlocked')),
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS capsule_tags (
  capsule_id INT REFERENCES capsules(id) ON DELETE CASCADE,
  tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (capsule_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_capsules_user ON capsules(user_id);
CREATE INDEX IF NOT EXISTS idx_capsules_status_unlock ON capsules(status, unlock_at);