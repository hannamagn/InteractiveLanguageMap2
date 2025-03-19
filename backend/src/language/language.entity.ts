import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Language {
  @PrimaryGeneratedColumn()
  id: number | undefined;

  @Column()
  name: string | undefined;

}
