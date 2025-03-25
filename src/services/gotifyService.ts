const apiKey = process.env.GOTIFY_TOKEN;

export interface GotifyAttachment {
  name: string;
  data: string;
  content_type: string;
}

export default class GotifyService {
  static gotifyUrl = process.env.GOTIFY_ROOT_URL?.replace(/\/$/, '');

  static async sendMessage(
    to: string,
    from: string,
    subject: string,
    body: string,
    attachments: GotifyAttachment[] = []
  ) {
    const response = await fetch(this.gotifyUrl + '/mail', {
      method: 'POST',
      headers: {
        Authorization: 'pre-shared: ' + apiKey
      },
      body: JSON.stringify({
        to,
        from,
        subject,
        body,
        attachments
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => response.statusText);
      throw new Error(`Gotify request failed with status ${response.status}`, {
        cause: errorData
      });
    }
  }
}
