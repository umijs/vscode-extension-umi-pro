import { EXCLUDE_EXT_NAMES } from './../common/types';
import { VscodeServiceToken, IVscodeService } from './vscodeService';
import { LoggerService, ILogger } from './../common/logger';
import { Service, Token, Inject } from 'typedi';
import { JS_EXT_NAMES } from '../common/types';
import { dirname, extname, basename } from 'path';
import globby from 'globby';

export interface IRouterInfoService {
  getAllPages(filePath: string): Promise<string[]>;
}

export const RouterInfoServiceToken = new Token<IRouterInfoService>();

@Service(RouterInfoServiceToken)
export class RouterInfoService implements IRouterInfoService {
  public readonly vscodeService: IVscodeService;
  private readonly logger: ILogger;

  constructor(
    @Inject(LoggerService)
    logger: ILogger,
    @Inject(VscodeServiceToken)
    vscodeService: IVscodeService
  ) {
    this.logger = logger;
    this.logger.info('create RouterInfoService');
    this.vscodeService = vscodeService;
  }

  getAllPages = async (cwd: string) => {
    const config = this.vscodeService.getConfig(cwd);

    let pagePattern = [
      `./**/*{${JS_EXT_NAMES.join(',')}}`,
      `!./**/models/**/*{${JS_EXT_NAMES.join(',')}}`,
      '!**/model.js',
    ];

    if (config && Array.isArray(config.routerExcludePath)) {
      pagePattern = pagePattern.concat(config.routerExcludePath.map(o => `!${o}`));
    }

    const pages = (await globby(pagePattern, {
      cwd,
      deep: true,
    })).filter(p => EXCLUDE_EXT_NAMES.every(ext => !p.endsWith(ext)));

    const pageSet = pages.reduce((set, page) => {
      const ext = extname(page);
      let pagePath = page.slice(0, -ext.length);
      if (basename(pagePath) === 'index' && pagePath !== 'index') {
        pagePath = dirname(pagePath);
      }
      set.add(pagePath);
      return set;
    }, new Set<string>());

    return Array.from(pageSet);
  };
}
