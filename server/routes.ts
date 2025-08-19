import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConsumerSchema, insertPresenceSchema, insertConsumptionSchema } from "@shared/schema";
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, AlignmentType, WidthType } from "docx";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => new Date().toISOString().split('T')[0];

  // CONSUMERS ENDPOINTS
  app.get("/api/consommateurs", async (req, res) => {
    try {
      const consumers = await storage.getConsumers();
      res.json(consumers);
    } catch (error) {
      console.error("Error fetching consumers:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des consommateurs" });
    }
  });

  app.post("/api/consommateurs", async (req, res) => {
    try {
      const validatedData = insertConsumerSchema.parse(req.body);
      const consumer = await storage.createConsumer(validatedData);
      res.status(201).json(consumer);
    } catch (error) {
      console.error("Error creating consumer:", error);
      res.status(400).json({ message: "Données invalides pour créer un consommateur" });
    }
  });

  app.delete("/api/consommateurs/:id", async (req, res) => {
    try {
      await storage.deleteConsumer(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting consumer:", error);
      res.status(500).json({ message: "Erreur lors de la suppression du consommateur" });
    }
  });

  // PRESENCES ENDPOINTS
  app.post("/api/presences", async (req, res) => {
    try {
      const validatedData = insertPresenceSchema.parse(req.body);
      const presence = await storage.markPresence(validatedData);
      res.status(201).json(presence);
    } catch (error) {
      console.error("Error marking presence:", error);
      res.status(400).json({ message: "Erreur lors de l'enregistrement de la présence" });
    }
  });

  app.get("/api/presences/:date", async (req, res) => {
    try {
      const consumersWithPresence = await storage.getConsumersWithPresence(req.params.date);
      res.json(consumersWithPresence);
    } catch (error) {
      console.error("Error fetching presences:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des présences" });
    }
  });

  // CONSUMPTIONS ENDPOINTS
  app.post("/api/consommations", async (req, res) => {
    try {
      const data = {
        ...req.body,
        date: req.body.date || getCurrentDate()
      };
      const validatedData = insertConsumptionSchema.parse(data);
      const consumption = await storage.createConsumption(validatedData);
      res.status(201).json(consumption);
    } catch (error) {
      console.error("Error creating consumption:", error);
      res.status(400).json({ message: "Erreur lors de l'enregistrement de la consommation" });
    }
  });

  app.get("/api/consommations", async (req, res) => {
    try {
      const date = req.query.date as string || getCurrentDate();
      const consumptions = await storage.getConsumptionsByDate(date);
      res.json(consumptions);
    } catch (error) {
      console.error("Error fetching consumptions:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des consommations" });
    }
  });

  // STATISTICS ENDPOINT
  app.get("/api/statistics", async (req, res) => {
    try {
      const date = req.query.date as string || getCurrentDate();
      const stats = await storage.getDailyStats(date);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des statistiques" });
    }
  });

  // WORD REPORT ENDPOINT
  app.get("/api/rapport/journalier", async (req, res) => {
    try {
      const date = req.query.date as string || getCurrentDate();
      const consumptions = await storage.getConsumptionsByDate(date);
      const stats = await storage.getDailyStats(date);

      // Create Word document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "SITAB - Rapport Journalier des Consommations",
                    bold: true,
                    size: 28,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Date: ${new Date(date).toLocaleDateString('fr-FR')}`,
                    size: 24,
                  }),
                ],
                spacing: { after: 400 },
              }),
              new Table({
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
                rows: [
                  // Header row
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "Nom", bold: true })] })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "Montant", bold: true })] })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "Heure", bold: true })] })],
                      }),
                    ],
                  }),
                  // Data rows
                  ...consumptions.map(consumption => 
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [new Paragraph({ children: [new TextRun({ text: consumption.consumer.name })] })],
                        }),
                        new TableCell({
                          children: [new Paragraph({ children: [new TextRun({ text: `${consumption.amount} FCFA` })] })],
                        }),
                        new TableCell({
                          children: [new Paragraph({ children: [new TextRun({ text: new Date(consumption.createdAt!).toLocaleTimeString('fr-FR') })] })],
                        }),
                      ],
                    })
                  ),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `\nTotal journalier: ${stats.dailyRevenue} FCFA`,
                    bold: true,
                    size: 24,
                  }),
                ],
                spacing: { before: 400 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Nombre de consommations: ${stats.dailyConsumptions}`,
                    size: 20,
                  }),
                ],
              }),
            ],
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename=Rapport_Journalier_${date.replace(/-/g, '_')}.docx`);
      res.send(buffer);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Erreur lors de la génération du rapport" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
