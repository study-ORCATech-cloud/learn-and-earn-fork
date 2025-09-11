
# Backup and Recovery Guide

This document outlines comprehensive backup strategies and disaster recovery procedures for the LabDojo Learning Platform, ensuring data protection and business continuity.

## Table of Contents

1. [Overview](#overview)
2. [Backup Strategy](#backup-strategy)
3. [Data Classification](#data-classification)
4. [Backup Types and Schedules](#backup-types-and-schedules)
5. [Storage Solutions](#storage-solutions)
6. [Backup Procedures](#backup-procedures)
7. [Recovery Procedures](#recovery-procedures)
8. [Disaster Recovery Planning](#disaster-recovery-planning)
9. [Testing and Validation](#testing-and-validation)
10. [Monitoring and Alerting](#monitoring-and-alerting)
11. [Security Considerations](#security-considerations)
12. [Documentation and Compliance](#documentation-and-compliance)

## Overview

The LabDojo Learning Platform requires robust backup and recovery procedures to protect against:

- Hardware failures
- Software corruption
- Human errors
- Cyber attacks
- Natural disasters
- Service provider outages

### Recovery Objectives

- **Recovery Time Objective (RTO)**: Maximum acceptable downtime
- **Recovery Point Objective (RPO)**: Maximum acceptable data loss
- **Mean Time to Recovery (MTTR)**: Average time to restore services

## Backup Strategy

### 3-2-1 Backup Rule

Follow the industry-standard 3-2-1 backup strategy:

- **3** copies of critical data
- **2** different storage media types
- **1** offsite backup location

### Backup Principles

1. **Automated Backups**: Reduce human error through automation
2. **Regular Testing**: Verify backup integrity and recovery procedures
3. **Version Control**: Maintain multiple backup versions
4. **Encryption**: Protect data in transit and at rest
5. **Documentation**: Maintain detailed backup and recovery procedures

## Data Classification

### Critical Data (Tier 1)
- User accounts and authentication data
- Learning progress and achievements
- Course content and materials
- System configurations
- Database schemas

**Backup Frequency**: Real-time/Continuous
**Retention**: 1 year + legal requirements
**RTO**: < 1 hour
**RPO**: < 15 minutes

### Important Data (Tier 2)
- User preferences and settings
- Analytics and metrics
- Application logs (recent)
- Static assets and media

**Backup Frequency**: Hourly
**Retention**: 6 months
**RTO**: < 4 hours
**RPO**: < 1 hour

### Standard Data (Tier 3)
- Historical logs
- Temporary files
- Cache data
- Development/staging data

**Backup Frequency**: Daily
**Retention**: 3 months
**RTO**: < 24 hours
**RPO**: < 24 hours

## Backup Types and Schedules

### Full Backups
Complete copy of all data and systems.

```bash
# Weekly full backup schedule
0 2 * * 0 /scripts/full-backup.sh
```

**Schedule**: Weekly (Sundays 2:00 AM)
**Storage**: Primary and secondary locations
**Retention**: 4 weeks

### Incremental Backups
Only changed data since last backup.

```bash
# Daily incremental backup
0 3 * * 1-6 /scripts/incremental-backup.sh
```

**Schedule**: Daily (Monday-Saturday 3:00 AM)
**Storage**: Primary location with weekly offsite sync
**Retention**: 2 weeks

### Differential Backups
All changes since last full backup.

```bash
# Mid-week differential backup
0 4 * * 3 /scripts/differential-backup.sh
```

**Schedule**: Weekly (Wednesdays 4:00 AM)
**Storage**: Primary and secondary locations
**Retention**: 4 weeks

### Continuous Data Protection (CDP)
Real-time backup for critical systems.

**Implementation**: Database replication and log shipping
**Schedule**: Continuous
**Storage**: Hot standby systems
**Retention**: 72 hours of point-in-time recovery

## Storage Solutions

### Primary Backup Storage

#### Local Storage
- High-speed SSD/NVMe arrays
- RAID configurations for redundancy
- Automated backup software
- Local network access for fast recovery

```yaml
# Local backup configuration
local_backup:
  storage_type: "SSD_RAID_10"
  capacity: "10TB"
  encryption: "AES-256"
  compression: "enabled"
  deduplication: "enabled"
```

#### Cloud Storage
- AWS S3, Google Cloud Storage, Azure Blob
- Multiple availability zones
- Versioning and lifecycle policies
- Cross-region replication

```yaml
# Cloud backup configuration
cloud_backup:
  provider: "AWS_S3"
  storage_class: "Standard_IA"
  versioning: "enabled"
  lifecycle_policy: "90_days_to_glacier"
  cross_region_replication: "enabled"
```

### Secondary Backup Storage

#### Offsite Cloud Storage
- Different cloud provider or region
- Cold storage for long-term retention
- Immutable backup storage
- Geographic distribution

#### Physical Media
- Encrypted external drives
- Tape storage for archival
- Secure offsite storage facility
- Regular media rotation

### Backup Storage Security

```yaml
# Security configuration
backup_security:
  encryption:
    at_rest: "AES-256"
    in_transit: "TLS-1.3"
    key_management: "HSM"
  access_control:
    authentication: "MFA_required"
    authorization: "RBAC"
    audit_logging: "enabled"
  immutability:
    write_once_read_many: "enabled"
    retention_lock: "legal_hold_capable"
```

## Backup Procedures

### Database Backup

#### PostgreSQL Backup Script
```bash
#!/bin/bash
# PostgreSQL backup script

DB_NAME="labdojo_prod"
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup with compression
pg_dump $DB_NAME | gzip > $BACKUP_FILE

# Verify backup integrity
if [ $? -eq 0 ]; then
    echo "Database backup successful: $BACKUP_FILE"
    
    # Upload to cloud storage
    aws s3 cp $BACKUP_FILE s3://labdojo-backups/database/
    
    # Clean up old local backups (keep 7 days)
    find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
else
    echo "Database backup failed!"
    # Send alert notification
    curl -X POST "https://api.slack.com/webhook" \
         -d "{'text': 'Database backup failed for $DB_NAME'}"
fi
```

#### MongoDB Backup Script
```bash
#!/bin/bash
# MongoDB backup script

DB_NAME="labdojo"
BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="${BACKUP_DIR}/${DB_NAME}_${DATE}"

# Create backup
mongodump --db $DB_NAME --out $BACKUP_PATH

# Compress backup
tar -czf "${BACKUP_PATH}.tar.gz" -C $BACKUP_DIR "${DB_NAME}_${DATE}"
rm -rf $BACKUP_PATH

# Upload and cleanup
aws s3 cp "${BACKUP_PATH}.tar.gz" s3://labdojo-backups/mongodb/
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### Application Backup

#### Source Code Backup
```bash
#!/bin/bash
# Source code backup script

REPO_DIR="/var/www/labdojo"
BACKUP_DIR="/backups/source"
DATE=$(date +%Y%m%d_%H%M%S)

cd $REPO_DIR

# Create git bundle
git bundle create "${BACKUP_DIR}/labdojo_${DATE}.bundle" --all

# Create source archive
tar -czf "${BACKUP_DIR}/labdojo_source_${DATE}.tar.gz" \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='dist' \
    .

# Upload to cloud storage
aws s3 sync $BACKUP_DIR s3://labdojo-backups/source/
```

#### Configuration Backup
```bash
#!/bin/bash
# Configuration backup script

CONFIG_DIRS=(
    "/etc/nginx"
    "/etc/ssl/certs"
    "/opt/labdojo/config"
    "/var/lib/docker/volumes"
)

BACKUP_DIR="/backups/config"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/config_${DATE}.tar.gz"

# Create configuration backup
tar -czf $BACKUP_FILE "${CONFIG_DIRS[@]}"

# Upload and cleanup
aws s3 cp $BACKUP_FILE s3://labdojo-backups/config/
find $BACKUP_DIR -name "config_*.tar.gz" -mtime +30 -delete
```

### User Data Backup

#### User Progress Backup
```bash
#!/bin/bash
# User progress data backup

# Export user progress from database
psql -d labdojo_prod -c "COPY (
    SELECT 
        user_id,
        progress_data,
        achievements,
        favorites,
        last_updated
    FROM user_progress
) TO STDOUT WITH CSV HEADER" | gzip > "/backups/user_progress_$(date +%Y%m%d).csv.gz"

# Upload to secure storage
aws s3 cp "/backups/user_progress_$(date +%Y%m%d).csv.gz" \
         s3://labdojo-backups/user-data/ \
         --server-side-encryption AES256
```

## Recovery Procedures

### Database Recovery

#### Point-in-Time Recovery
```bash
#!/bin/bash
# PostgreSQL point-in-time recovery

TARGET_TIME="2024-01-15 14:30:00"
BACKUP_FILE="/backups/database/labdojo_prod_20240115_020000.sql.gz"

# Stop application services
systemctl stop labdojo-app

# Drop existing database
dropdb labdojo_prod

# Create new database
createdb labdojo_prod

# Restore from backup
gunzip -c $BACKUP_FILE | psql labdojo_prod

# Apply WAL files for point-in-time recovery
pg_resetwal -f /var/lib/postgresql/data

# Start services
systemctl start postgresql
systemctl start labdojo-app

# Verify recovery
psql -d labdojo_prod -c "SELECT NOW() as recovery_time;"
```

#### Full Database Restore
```bash
#!/bin/bash
# Full database restore procedure

BACKUP_FILE=$1
if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# Create maintenance page
cp /var/www/maintenance.html /var/www/html/index.html

# Stop services
systemctl stop labdojo-app nginx

# Restore database
gunzip -c $BACKUP_FILE | psql labdojo_prod

# Restart services
systemctl start postgresql labdojo-app nginx

# Remove maintenance page
rm /var/www/html/index.html

echo "Database restore completed from $BACKUP_FILE"
```

### Application Recovery

#### Container Recovery
```bash
#!/bin/bash
# Docker container recovery

# Pull latest images
docker-compose pull

# Stop and remove containers
docker-compose down

# Restore configuration
tar -xzf /backups/config/config_latest.tar.gz -C /

# Start services
docker-compose up -d

# Verify services
docker-compose ps
curl -f http://localhost/health || echo "Health check failed"
```

#### File System Recovery
```bash
#!/bin/bash
# File system recovery from backup

BACKUP_DATE=$1
RESTORE_PATH="/var/www/labdojo"

# Download backup from cloud
aws s3 cp "s3://labdojo-backups/source/labdojo_source_${BACKUP_DATE}.tar.gz" /tmp/

# Stop services
systemctl stop labdojo-app

# Backup current state
mv $RESTORE_PATH "${RESTORE_PATH}.backup.$(date +%s)"

# Extract backup
mkdir -p $RESTORE_PATH
tar -xzf "/tmp/labdojo_source_${BACKUP_DATE}.tar.gz" -C $RESTORE_PATH

# Set permissions
chown -R www-data:www-data $RESTORE_PATH
chmod -R 755 $RESTORE_PATH

# Install dependencies
cd $RESTORE_PATH
npm install

# Build application
npm run build

# Start services
systemctl start labdojo-app
```

## Disaster Recovery Planning

### Disaster Recovery Sites

#### Hot Site (Active-Active)
- Fully operational duplicate environment
- Real-time data synchronization
- Automatic failover capability
- RTO: < 1 hour, RPO: < 15 minutes

```yaml
hot_site:
  location: "Secondary_Data_Center"
  synchronization: "real_time"
  failover: "automatic"
  capacity: "100%_of_primary"
  testing_frequency: "monthly"
```

#### Warm Site (Active-Passive)
- Pre-configured hardware and software
- Regular data synchronization
- Manual failover process
- RTO: < 4 hours, RPO: < 1 hour

```yaml
warm_site:
  location: "Cloud_Provider_Region_B"
  synchronization: "hourly"
  failover: "manual"
  capacity: "75%_of_primary"
  testing_frequency: "quarterly"
```

#### Cold Site (Backup-Only)
- Basic infrastructure only
- Latest backup restoration required
- Extended recovery time
- RTO: < 24 hours, RPO: < 24 hours

### Disaster Recovery Procedures

#### Communication Plan
```yaml
communication_plan:
  notification_order:
    1: "IT_Operations_Manager"
    2: "Business_Continuity_Team"
    3: "Executive_Leadership"
    4: "All_Staff"
    5: "Customers_and_Partners"
  
  communication_channels:
    internal: "Slack, Email, SMS"
    external: "Website, Social Media, Press"
  
  contact_information:
    primary: "emergency-contact-list.xlsx"
    backup: "printed-contact-cards"
```

#### Recovery Team Roles
```yaml
recovery_team:
  incident_commander:
    responsible_for: "Overall recovery coordination"
    contact: "ic@labdojo.com"
  
  technical_lead:
    responsible_for: "System restoration"
    contact: "tech-lead@labdojo.com"
  
  communications_lead:
    responsible_for: "Stakeholder communication"
    contact: "comms@labdojo.com"
  
  business_continuity:
    responsible_for: "Business operations"
    contact: "bc@labdojo.com"
```

### Failover Procedures

#### Automated Failover
```bash
#!/bin/bash
# Automated failover script

HEALTH_CHECK_URL="https://labdojo.com/health"
SECONDARY_SITE="https://backup.labdojo.com"

# Check primary site health
if ! curl -f $HEALTH_CHECK_URL >/dev/null 2>&1; then
    echo "Primary site failed health check"
    
    # Update DNS to point to secondary site
    aws route53 change-resource-record-sets \
        --hosted-zone-id Z123456789 \
        --change-batch file://failover-dns-change.json
    
    # Notify operations team
    send_alert "Primary site failover initiated"
    
    # Start monitoring secondary site
    monitor_secondary_site.sh &
fi
```

## Testing and Validation

### Backup Testing Schedule

#### Monthly Tests
- Backup integrity verification
- Sample restore procedures
- Recovery time measurement
- Documentation updates

#### Quarterly Tests
- Full disaster recovery simulation
- Failover testing
- Communication plan validation
- Team training exercises

#### Annual Tests
- Complete disaster recovery drill
- Third-party security assessment
- Compliance audit
- Plan review and updates

### Test Procedures

#### Backup Integrity Test
```bash
#!/bin/bash
# Backup integrity test script

BACKUP_FILE=$1
TEST_DB="labdojo_test"

# Create test database
createdb $TEST_DB

# Restore backup to test database
gunzip -c $BACKUP_FILE | psql $TEST_DB

# Run integrity checks
psql -d $TEST_DB -c "
    SELECT 
        schemaname,
        tablename,
        n_tup_ins,
        n_tup_upd,
        n_tup_del
    FROM pg_stat_user_tables;
"

# Compare with production checksums
psql -d $TEST_DB -c "SELECT md5(string_agg(id::text, '' ORDER BY id)) FROM users;" > test_checksum.txt
psql -d labdojo_prod -c "SELECT md5(string_agg(id::text, '' ORDER BY id)) FROM users;" > prod_checksum.txt

if diff test_checksum.txt prod_checksum.txt; then
    echo "Backup integrity test PASSED"
else
    echo "Backup integrity test FAILED"
    exit 1
fi

# Cleanup
dropdb $TEST_DB
rm test_checksum.txt prod_checksum.txt
```

#### Recovery Time Test
```bash
#!/bin/bash
# Recovery time measurement

START_TIME=$(date +%s)

# Perform test recovery
./test-recovery.sh

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "Recovery completed in $DURATION seconds"

# Log results
echo "$(date): Recovery test duration: ${DURATION}s" >> /var/log/recovery-tests.log

# Check if within RTO
if [ $DURATION -le 3600 ]; then
    echo "Recovery time within RTO (1 hour)"
else
    echo "Recovery time exceeds RTO - escalate"
    send_alert "Recovery time test failed: ${DURATION}s > 3600s"
fi
```

## Monitoring and Alerting

### Backup Monitoring

#### Health Checks
```bash
#!/bin/bash
# Backup health monitoring

# Check last backup timestamp
LAST_BACKUP=$(find /backups -name "*.sql.gz" -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)
BACKUP_AGE=$(( $(date +%s) - $(stat -c %Y "$LAST_BACKUP") ))

if [ $BACKUP_AGE -gt 86400 ]; then
    send_alert "Backup is older than 24 hours"
fi

# Check backup storage usage
STORAGE_USAGE=$(df /backups | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $STORAGE_USAGE -gt 85 ]; then
    send_alert "Backup storage usage at ${STORAGE_USAGE}%"
fi

# Verify cloud backup sync
aws s3 ls s3://labdojo-backups/database/ --recursive | tail -1 | grep $(date +%Y%m%d) || {
    send_alert "Cloud backup sync failed"
}
```

#### Alert Configuration
```yaml
alerting:
  backup_failure:
    severity: "critical"
    notification: "immediate"
    escalation: "15_minutes"
  
  storage_full:
    severity: "warning"
    notification: "within_1_hour"
    escalation: "4_hours"
  
  recovery_test_failure:
    severity: "high"
    notification: "within_30_minutes"
    escalation: "2_hours"
```

### Monitoring Dashboard
```yaml
monitoring_metrics:
  backup_success_rate:
    description: "Percentage of successful backups"
    target: ">99%"
  
  recovery_time_objective:
    description: "Time to restore critical systems"
    target: "<1_hour"
  
  backup_storage_growth:
    description: "Rate of backup storage consumption"
    alert_threshold: ">20%_monthly_growth"
  
  data_integrity_score:
    description: "Backup validation success rate"
    target: "100%"
```

## Security Considerations

### Backup Security

#### Encryption Standards
```yaml
encryption:
  algorithms:
    symmetric: "AES-256-GCM"
    asymmetric: "RSA-4096"
    hashing: "SHA-512"
  
  key_management:
    storage: "Hardware_Security_Module"
    rotation: "quarterly"
    backup: "secure_offsite_location"
  
  transport_security:
    protocol: "TLS_1.3"
    certificate_validation: "strict"
```

#### Access Controls
```yaml
access_control:
  authentication:
    method: "multi_factor"
    token_lifetime: "8_hours"
  
  authorization:
    model: "role_based"
    principle: "least_privilege"
  
  audit_logging:
    all_access: "logged"
    retention: "7_years"
    monitoring: "real_time"
```

### Compliance Requirements

#### Data Protection Regulations
- GDPR compliance for EU user data
- CCPA compliance for California residents
- SOC 2 Type II for security controls
- ISO 27001 for information security

#### Backup Retention Policies
```yaml
retention_policies:
  personal_data:
    active_users: "as_long_as_account_exists"
    deleted_accounts: "30_days_then_purge"
    backup_retention: "follow_primary_retention"
  
  business_data:
    operational: "7_years"
    financial: "10_years"
    legal: "permanent_until_released"
  
  technical_data:
    logs: "2_years"
    metrics: "5_years"
    configurations: "indefinite"
```

## Documentation and Compliance

### Required Documentation

#### Backup Procedures Manual
- Step-by-step backup procedures
- Recovery procedures for each scenario
- Contact information and escalation paths
- Testing schedules and results

#### Disaster Recovery Plan
- Business impact analysis
- Recovery strategies
- Team roles and responsibilities
- Communication procedures

#### Compliance Reports
- Backup testing results
- Security audit findings
- Regulatory compliance status
- Incident response reports

### Documentation Maintenance

#### Review Schedule
- Monthly: Procedure accuracy
- Quarterly: Contact information
- Annually: Full plan review
- After incidents: Lessons learned updates

#### Version Control
```yaml
document_control:
  versioning: "semantic_versioning"
  approval_required: "two_person_rule"
  distribution: "controlled_access"
  archival: "previous_versions_retained"
```

## Best Practices and Recommendations

### Backup Best Practices

1. **Automate Everything**: Reduce human error through automation
2. **Test Regularly**: Untested backups are not reliable backups
3. **Monitor Continuously**: Proactive monitoring prevents surprises
4. **Document Thoroughly**: Clear procedures enable faster recovery
5. **Train Teams**: Regular training ensures readiness

### Recovery Optimization

1. **Prioritize Critical Systems**: Focus on business-critical services first
2. **Parallel Recovery**: Restore multiple systems simultaneously when possible
3. **Incremental Verification**: Verify each step before proceeding
4. **Communication**: Keep stakeholders informed throughout recovery

### Continuous Improvement

1. **Post-Incident Reviews**: Learn from every incident
2. **Technology Updates**: Regularly evaluate new backup technologies
3. **Capacity Planning**: Anticipate future backup storage needs
4. **Process Refinement**: Continuously improve procedures based on experience

## Conclusion

A comprehensive backup and recovery strategy is essential for maintaining the reliability and availability of the LabDojo Learning Platform. This guide provides the framework for protecting data and ensuring business continuity.

Key success factors:
- Regular testing and validation
- Automated processes where possible
- Clear documentation and procedures
- Trained and prepared recovery teams
- Continuous monitoring and improvement

Remember: The best backup strategy is one that has been tested and proven to work when needed.

For specific implementation guidance or technical support, consult the technical team or refer to vendor documentation for your chosen backup solutions.
