import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  address: text("address").unique(),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Carbon offset claim model
export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  producerId: integer("producer_id").references(() => users.id),
  projectName: text("project_name").notNull(),
  projectDescription: text("project_description").notNull(),
  co2Offset: integer("co2_offset").notNull(),
  ipfsHash: text("ipfs_hash").notNull(),
  status: text("status").default("pending"),
  timestamp: timestamp("timestamp").defaultNow(),
  approvalTimestamp: timestamp("approval_timestamp"),
  tokenId: text("token_id"),
});

// NFT certificate model
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  tokenId: text("token_id").notNull().unique(),
  ownerId: integer("owner_id").references(() => users.id),
  claimId: integer("claim_id").references(() => claims.id),
  price: text("price"),
  isListed: boolean("is_listed").default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transactions model
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  certificateId: integer("certificate_id").references(() => certificates.id),
  sellerId: integer("seller_id").references(() => users.id),
  buyerId: integer("buyer_id").references(() => users.id),
  price: text("price").notNull(),
  transactionHash: text("transaction_hash").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  timestamp: true,
  approvalTimestamp: true,
  tokenId: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  timestamp: true,
});

// Define types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Claim = typeof claims.$inferSelect;

export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificates.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
