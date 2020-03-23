import EventEmitter from 'events';

import Session from '../session/Session';
import { Connector } from '../bot/Connector';
import { RequestContext } from '../types';

import ConsoleContext from './ConsoleContext';
import ConsoleEvent, { ConsoleRawEvent } from './ConsoleEvent';
import { ConsoleClient } from './ConsoleClient';

type ConsoleRequestBody = ConsoleRawEvent;

type ConstructorOptions = {
  client?: ConsoleClient;
  fallbackMethods?: boolean;
  mockPlatform?: string;
};

export default class ConsoleConnector
  implements Connector<ConsoleRequestBody, ConsoleClient> {
  /** @hidden */
  _client: ConsoleClient;

  /** @hidden */
  _fallbackMethods: boolean;

  /** @hidden */
  _platform: string;

  /**
   * constructor
   */
  constructor(options: ConstructorOptions = {}) {
    const {
      client,
      fallbackMethods,
      mockPlatform,
    } = options
    this._client = client || {
      sendText: (text): void => {
        process.stdout.write(`Bot > ${text}\n`);
      },
    };
    this._fallbackMethods = fallbackMethods || false;
    this._platform = mockPlatform || 'console';
  }

  get platform(): string {
    return this._platform;
  }

  get client(): ConsoleClient {
    return this._client;
  }

  getUniqueSessionKey(): string {
    return '1';
  }

  async updateSession(session: Session): Promise<void> {
    if (!session.user) {
      session.user = {
        id: '1',
        name: 'you',
        _updatedAt: new Date().toISOString(),
      };
    }

    Object.freeze(session.user);
    Object.defineProperty(session, 'user', {
      configurable: false,
      enumerable: true,
      writable: false,
      value: session.user,
    });
  }

  mapRequestToEvents(body: ConsoleRequestBody): ConsoleEvent[] {
    return [new ConsoleEvent(body)];
  }

  createContext(params: {
    event: ConsoleEvent;
    session: Session | null;
    initialState?: Record<string, any> | null;
    requestContext?: RequestContext;
    emitter: EventEmitter | null;
  }): ConsoleContext {
    return new ConsoleContext({
      ...params,
      client: this._client,
      fallbackMethods: this._fallbackMethods,
      mockPlatform: this._platform,
    });
  }
}
