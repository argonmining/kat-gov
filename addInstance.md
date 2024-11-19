# Adding a New Instance

This guide provides detailed steps to set up a new instance of your application, including configuring PM2, Nginx, environment variables, database setup, and SSL with Certbot.

## Step 1: Set Up Environment Variables

1. **Create a New Environment File**:
   - Copy one of the existing `.env` files (e.g., `.env.kdao` or `.env.katgov`) and rename it to match your new instance (e.g., `.env.newinstance`).

2. **Edit the Environment File**:
   - Update the `PORT` to a unique value that is not used by other instances.
   - Update other configurations as needed, such as `DB_NAME`, `DB_USER`, and `DB_PASS`.

## Step 2: Configure PM2

1. **Create or Update the PM2 Ecosystem File**:
   - If you haven't already, create an `ecosystem.config.cjs` file in the root of your project.

2. **Add a New Application Entry**:
   - Add a new entry for your instance in the `ecosystem.config.cjs` file:

   ```javascript
   module.exports = {
     apps: [
       {
         name: 'new-instance',
         script: 'dist/index.js',
         env: {
           NODE_ENV: 'newinstance',
         },
       },
       // Add other instances here
     ],
   };
   ```

3. **Start the New Instance with PM2**:
   - Use the following command to start the new instance:

   ```bash
   pm2 start ecosystem.config.cjs
   ```

## Step 3: Configure Nginx

1. **Create a New Nginx Configuration File**:
   - Create a new file in `/etc/nginx/sites-available/` named after your new instance (e.g., `newinstance.conf`).

2. **Edit the Nginx Configuration**:
   - Add the following configuration, replacing placeholders with your actual domain and port:

   ```nginx
   server {
       listen 80;
       server_name your.newinstance.domain;

       location / {
           proxy_pass http://localhost:YOUR_NEW_PORT;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Enable the Configuration**:
   - Create a symbolic link to the configuration file in `/etc/nginx/sites-enabled/`:

   ```bash
   sudo ln -s /etc/nginx/sites-available/newinstance.conf /etc/nginx/sites-enabled/
   ```

4. **Test and Reload Nginx**:
   - Test the Nginx configuration for syntax errors:

   ```bash
   sudo nginx -t
   ```

   - If the test is successful, reload Nginx:

   ```bash
   sudo systemctl reload nginx
   ```

## Step 4: Set Up the Database

1. **Create a New Database and User**:
   - Log into PostgreSQL:

   ```bash
   sudo -i -u postgres
   psql
   ```

   - Create a new database and user:

   ```sql
   CREATE DATABASE newinstance_db;
   CREATE USER newinstance_user WITH PASSWORD 'yourpassword';
   GRANT ALL PRIVILEGES ON DATABASE newinstance_db TO newinstance_user;
   ```

2. **Set Up the Database Schema**:
   - Exit `psql` and run the schema setup:

   ```bash
   psql -d newinstance_db -f /path/to/katgov_schema.sql
   ```

3. **Insert Static Data**:
   - Log back into the database and insert static data:

   ```bash
   psql -d newinstance_db
   ```

   - Run the following SQL commands:

   ```sql
   -- Proposal Types
   INSERT INTO proposal_types (name, simpleVote) VALUES ('DRAFT', true);
   INSERT INTO proposal_types (name, simpleVote) VALUES ('Funding', true);
   INSERT INTO proposal_types (name, simpleVote) VALUES ('Development', true);
   INSERT INTO proposal_types (name, simpleVote) VALUES ('Governance', false);

   -- Proposal Statuses
   INSERT INTO proposal_statuses (name, active) VALUES ('Draft', false);
   INSERT INTO proposal_statuses (name, active) VALUES ('Submitted', false);
   INSERT INTO proposal_statuses (name, active) VALUES ('Under Review', false);
   INSERT INTO proposal_statuses (name, active) VALUES ('Open for Nomination', true);
   INSERT INTO proposal_statuses (name, active) VALUES ('Pending Vote', true);
   INSERT INTO proposal_statuses (name, active) VALUES ('Voting Open', true);
   INSERT INTO proposal_statuses (name, active) VALUES ('Voting Closed', true);
   INSERT INTO proposal_statuses (name, active) VALUES ('Approved', true);
   INSERT INTO proposal_statuses (name, active) VALUES ('Rejected', true);
   INSERT INTO proposal_statuses (name, active) VALUES ('Archived', false);

   -- Election Types
   INSERT INTO election_types (name, active) VALUES ('DRAFT', false);
   INSERT INTO election_types (name, active) VALUES ('General', true);
   INSERT INTO election_types (name, active) VALUES ('Primary', true);
   INSERT INTO election_types (name, active) VALUES ('Special', true);

   -- Election Statuses
   INSERT INTO election_statuses (name, active) VALUES ('Draft', false);
   INSERT INTO election_statuses (name, active) VALUES ('Under Review', false);
   INSERT INTO election_statuses (name, active) VALUES ('Open for Nominations', true);
   INSERT INTO election_statuses (name, active) VALUES ('Pending Vote', true);
   INSERT INTO election_statuses (name, active) VALUES ('Voting Open', true);
   INSERT INTO election_statuses (name, active) VALUES ('Voting Closed', true);
   INSERT INTO election_statuses (name, active) VALUES ('Archived', false);

   -- Candidate Statuses
   INSERT INTO candidate_statuses (name, active) VALUES ('Draft', false);
   INSERT INTO candidate_statuses (name, active) VALUES ('Submitted', false);
   INSERT INTO candidate_statuses (name, active) VALUES ('Under Review', false);
   INSERT INTO candidate_statuses (name, active) VALUES ('Open for Nomination', true);
   INSERT INTO candidate_statuses (name, active) VALUES ('Primary Qualified', true);
   INSERT INTO candidate_statuses (name, active) VALUES ('General Qualified', true);
   INSERT INTO candidate_statuses (name, active) VALUES ('Elected', true);
   INSERT INTO candidate_statuses (name, active) VALUES ('Rejected', false);

   -- Election Positions
   INSERT INTO election_positions (title, description, created) VALUES ('Treasurer 1', 'TBA', NOW());
   INSERT INTO election_positions (title, description, created) VALUES ('Treasurer 2', 'TBA', NOW());
   INSERT INTO election_positions (title, description, created) VALUES ('Treasurer 3', 'TBA', NOW());
   INSERT INTO election_positions (title, description, created) VALUES ('Treasurer 4', 'TBA', NOW());
   INSERT INTO election_positions (title, description, created) VALUES ('Treasurer 5', 'TBA', NOW());
   INSERT INTO election_positions (title, description, created) VALUES ('Manager 1', 'TBA', NOW());
   INSERT INTO election_positions (title, description, created) VALUES ('Manager 2', 'TBA', NOW());
   INSERT INTO election_positions (title, description, created) VALUES ('Funding Lead', 'TBA', NOW());
   INSERT INTO election_positions (title, description, created) VALUES ('Development Lead', 'TBA', NOW());
   INSERT INTO election_positions (title, description, created) VALUES ('Marketing Lead', 'TBA', NOW());
   ```

## Step 5: Set Up SSL with Certbot

1. **Install Certbot**:
   - Install Certbot using the following command:

   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. **Generate SSL Certificate**:
   - Run the following command to generate an SSL certificate:

   ```bash
   sudo certbot --nginx -d your.newinstance.domain
   ```

3. **Configure Nginx to Use SSL**:
   - Update the Nginx configuration file to use SSL:

   ```nginx
   server {
       listen 443 ssl;
       server_name your.newinstance.domain;

       ssl_certificate /etc/letsencrypt/live/your.newinstance.domain/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your.newinstance.domain/privkey.pem;

       location / {
           proxy_pass http://localhost:YOUR_NEW_PORT;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

4. **Test and Reload Nginx**:
   - Test the Nginx configuration for syntax errors:

   ```bash
   sudo nginx -t
   ```

   - If the test is successful, reload Nginx:

   ```bash
   sudo systemctl reload nginx
   ```

## Step 6: Configure Cloudflare DNS

1. **Log into Cloudflare**:
   - Navigate to the DNS settings for your domain.

2. **Add a New DNS Record**:
   - Add an `A` record pointing your subdomain (e.g., `your.newinstance.domain`) to your server's IP address.

3. **Enable Proxy Status**:
   - Ensure the proxy status is enabled (orange cloud) for added security and performance benefits.

## Step 7: Verify the Setup

1. **Check PM2 Status**:
   - Ensure the new instance is running:

   ```bash
   pm2 list
   ```

2. **Access the Application**:
   - Open a browser and navigate to your new instance's domain to verify it is accessible.

## Additional Notes

- Ensure that your database and other services are configured to allow connections from the new instance.
- Update any necessary DNS records to point to your server's IP address for the new domain.

By following these steps, you can successfully deploy a new instance of your application with PM2, Nginx, and SSL.
