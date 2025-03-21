import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from './language.entity';

@Injectable()
export class LanguageService {
  constructor(
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
  ) {}

  // Hämta alla språk - detta kanske inte kommer gå att använda i frontend
  async findAll(): Promise<Language[]> {
    return this.languageRepository.find();
  }

  // Hämta ett specifikt språk med landuageID
  async findOne(id: number): Promise<Language | null> {
    return this.languageRepository.findOne({ where: { id } });
  }
}
