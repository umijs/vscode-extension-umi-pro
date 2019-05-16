import * as fs from 'mz/fs';
import { IDvaModel } from './../parser/interface';
import { IDvaModelParser } from '../parser';
import logger from '../logger';

interface ICacheKeyParser<T> {
  getKey(key: string): Promise<string | null>;
  getValue(key: string): Promise<T | null>;
}

interface ICache<T> {
  update(key: string): Promise<void>;

  get(key: string): Promise<T | null>;
}

export class ModelCacheKeyParser implements ICacheKeyParser<IDvaModel[]> {
  private parser: IDvaModelParser;

  constructor(parser: IDvaModelParser) {
    this.parser = parser;
  }

  getKey = async filePath => {
    if (!(await fs.exists(filePath))) {
      return null;
    }
    return filePath;
  };

  getValue = async filePath => {
    if (!(await fs.exists(filePath))) {
      return null;
    }
    try {
      return await this.parser.parseFile(filePath);
    } catch (error) {
      logger.info(`解析文件失败 ${filePath}`);
      logger.info(error.message);
    }
    return null;
  };
}

export class ModelCache implements ICache<IDvaModel[]> {
  private parser: ICacheKeyParser<IDvaModel[]>;

  private data: {
    [filename: string]: IDvaModel[] | null;
  };

  constructor(parser: ICacheKeyParser<IDvaModel[]>) {
    this.parser = parser;
    this.data = {};
  }

  update = async (key: string) => {
    const cacheKey = await this.parser.getKey(key);
    if (!cacheKey) {
      return;
    }
    this.data[cacheKey] = null;
  };

  get = async (key: string) => {
    const cacheKey = await this.parser.getKey(key);
    if (!cacheKey) {
      return null;
    }
    const value = this.data[cacheKey];
    if (!value) {
      this.data[cacheKey] = await this.parser.getValue(key);
    }
    return this.data[cacheKey];
  };
}
