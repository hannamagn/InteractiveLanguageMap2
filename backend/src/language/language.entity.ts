import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('languages') // Beroende på vad tabellen heter i databasen
export class Language {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  kmlUrl: string; 
}
