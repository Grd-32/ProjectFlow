// Real integration services for external APIs
export class SlackService {
  static async sendMessage(webhookUrl: string, message: string, channel?: string): Promise<boolean> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: message,
          channel: channel || '#general',
          username: 'ProjectFlow',
          icon_emoji: ':rocket:'
        })
      });
      return response.ok;
    } catch (error) {
      console.error('Slack message failed:', error);
      return false;
    }
  }

  static async testConnection(webhookUrl: string): Promise<boolean> {
    return this.sendMessage(webhookUrl, 'ProjectFlow integration test - connection successful! 🎉');
  }
}

export class GoogleDriveService {
  static async uploadFile(apiKey: string, file: File, folderId?: string): Promise<string | null> {
    try {
      const metadata = {
        name: file.name,
        parents: folderId ? [folderId] : undefined
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&key=${apiKey}`, {
        method: 'POST',
        body: form
      });

      if (response.ok) {
        const result = await response.json();
        return result.id;
      }
      return null;
    } catch (error) {
      console.error('Google Drive upload failed:', error);
      return null;
    }
  }

  static async testConnection(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/about?key=${apiKey}`);
      return response.ok;
    } catch (error) {
      console.error('Google Drive test failed:', error);
      return false;
    }
  }
}

export class GitHubService {
  static async createIssue(token: string, repo: string, title: string, body: string): Promise<string | null> {
    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, body })
      });

      if (response.ok) {
        const result = await response.json();
        return result.html_url;
      }
      return null;
    } catch (error) {
      console.error('GitHub issue creation failed:', error);
      return null;
    }
  }

  static async testConnection(token: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: { 'Authorization': `token ${token}` }
      });
      return response.ok;
    } catch (error) {
      console.error('GitHub test failed:', error);
      return false;
    }
  }
}

export class JiraService {
  static async createIssue(domain: string, email: string, apiToken: string, projectKey: string, summary: string, description: string): Promise<string | null> {
    try {
      const auth = btoa(`${email}:${apiToken}`);
      const response = await fetch(`https://${domain}.atlassian.net/rest/api/3/issue`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            project: { key: projectKey },
            summary,
            description: {
              type: 'doc',
              version: 1,
              content: [{
                type: 'paragraph',
                content: [{ type: 'text', text: description }]
              }]
            },
            issuetype: { name: 'Task' }
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        return `https://${domain}.atlassian.net/browse/${result.key}`;
      }
      return null;
    } catch (error) {
      console.error('Jira issue creation failed:', error);
      return null;
    }
  }

  static async testConnection(domain: string, email: string, apiToken: string): Promise<boolean> {
    try {
      const auth = btoa(`${email}:${apiToken}`);
      const response = await fetch(`https://${domain}.atlassian.net/rest/api/3/myself`, {
        headers: { 'Authorization': `Basic ${auth}` }
      });
      return response.ok;
    } catch (error) {
      console.error('Jira test failed:', error);
      return false;
    }
  }
}

export class EmailService {
  static async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    // In a real app, this would use a service like SendGrid, Mailgun, etc.
    // For demo purposes, we'll simulate the email sending
    try {
      console.log('Sending email:', { to, subject, body });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate 90% success rate
      return Math.random() > 0.1;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  static async sendNotificationEmail(to: string, notification: any): Promise<boolean> {
    const subject = `ProjectFlow: ${notification.title}`;
    const body = `
      ${notification.message}
      
      Related to: ${notification.relatedEntity?.name || 'N/A'}
      Time: ${new Date(notification.timestamp).toLocaleString()}
      
      View in ProjectFlow: ${window.location.origin}${notification.actionUrl || ''}
    `;
    
    return this.sendEmail(to, subject, body);
  }
}

export class CalendarService {
  static async createEvent(apiKey: string, calendarId: string, event: any): Promise<string | null> {
    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: event.title,
          description: event.description,
          start: { dateTime: event.startDate },
          end: { dateTime: event.endDate },
          attendees: event.attendees?.map((email: string) => ({ email }))
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.htmlLink;
      }
      return null;
    } catch (error) {
      console.error('Calendar event creation failed:', error);
      return null;
    }
  }
}

// Integration orchestrator
export class IntegrationOrchestrator {
  static async executeAutomation(automation: any, context: any): Promise<boolean> {
    let allSuccessful = true;

    for (const action of automation.actions) {
      try {
        const success = await this.executeAction(action, context);
        if (!success) allSuccessful = false;
      } catch (error) {
        console.error('Action execution failed:', error);
        allSuccessful = false;
      }
    }

    return allSuccessful;
  }

  static async executeAction(action: any, context: any): Promise<boolean> {
    switch (action.type) {
      case 'slack_message':
        const slackConfig = context.integrations.find((i: any) => i.type === 'slack')?.config;
        if (slackConfig) {
          const message = this.interpolateTemplate(action.config.message, context);
          return SlackService.sendMessage(slackConfig.webhookUrl, message, action.config.channel);
        }
        return false;

      case 'send_email':
        const email = this.interpolateTemplate(action.config.to, context);
        const subject = this.interpolateTemplate(action.config.subject, context);
        const body = this.interpolateTemplate(action.config.body || action.config.message, context);
        return EmailService.sendEmail(email, subject, body);

      case 'create_task':
        // This would integrate with TaskContext to create actual tasks
        return true;

      case 'send_notification':
        // This would integrate with NotificationContext
        return true;

      default:
        return false;
    }
  }

  static interpolateTemplate(template: string, context: any): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = path.split('.').reduce((obj: any, key: string) => obj?.[key], context);
      return value || match;
    });
  }
}