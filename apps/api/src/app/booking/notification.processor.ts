import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';

@Processor('notifications') // Nom de la queue
export class NotificationProcessor extends WorkerHost {
  private transporter: nodemailer.Transporter;

  constructor() {
    super();
    // Configuration SMTP Mailpit
    this.transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025, // Port SMTP de Mailpit
      secure: false,
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async process(job: Job<any, any, string>): Promise<any> {
    console.log(`📨 Traitement du job ${job.id} : ${job.name}`);

    if (job.name === 'booking-confirmation') {
      const { email, clientName, date, serviceName, businessName } = job.data;

      // Envoi réel du mail via Mailpit
      await this.transporter.sendMail({
        from: '"Spot. Notification" <no-reply@spot.ks>',
        to: email,
        subject: `Confirmation de RDV chez ${businessName}`,
        html: `
          <h1>Bonjour ${clientName},</h1>
          <p>Votre rendez-vous est confirmé !</p>
          <ul>
            <li><strong>Salon :</strong> ${businessName}</li>
            <li><strong>Prestation :</strong> ${serviceName}</li>
            <li><strong>Date :</strong> ${new Date(date).toLocaleString('fr-FR')}</li>
          </ul>
          <p>Merci d'utiliser Spot.</p>
        `,
      });
      
      console.log(`✅ Email envoyé à ${email}`);
    }
  }
}
