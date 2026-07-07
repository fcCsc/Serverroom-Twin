import { IAppConfiguration } from '../models/ServerRoomModels';

type SpHttpClientLike = {
  get: (url: string, configuration: unknown) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;
  post: (url: string, configuration: unknown, options: unknown) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;
};

const spConfig = { v1: {} };

export class ServerRoomConfigService {
  public constructor(private readonly spHttpClient: SpHttpClientLike | undefined, private readonly siteUrl: string | undefined, private readonly configListName = 'ServerRoomAppConfig') {}

  public async loadConfiguration(): Promise<IAppConfiguration | undefined> {
    if (!this.spHttpClient || !this.siteUrl) return undefined;
    const url = `${this.siteUrl}/_api/web/lists/getByTitle('${this.configListName}')/items?$select=Title,ConfigJson&$filter=Title eq 'Default'&$top=1`;
    const response = await this.spHttpClient.get(url, spConfig.v1);
    if (!response.ok) return undefined;
    const json = await response.json() as { value?: Array<{ ConfigJson?: string }> };
    const raw = json.value && json.value[0] ? json.value[0].ConfigJson : undefined;
    return raw ? JSON.parse(raw) as IAppConfiguration : undefined;
  }

  public async saveConfiguration(config: IAppConfiguration): Promise<void> {
    if (!this.spHttpClient || !this.siteUrl) return;
    const url = `${this.siteUrl}/_api/web/lists/getByTitle('${this.configListName}')/items`;
    await this.spHttpClient.post(url, spConfig.v1, { body: JSON.stringify({ Title: 'Default', ConfigJson: JSON.stringify(config) }) });
  }
}
