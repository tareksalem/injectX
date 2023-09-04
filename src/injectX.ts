import 'reflect-metadata';

export enum SupportedInjectableService {
  function = 'function',
  class = 'class',
  object = 'object',
  other = 'other',
}
function isClass(v) {
  const result = typeof v === 'function' && /^\s*class\s+/.test(v.toString());
  return result;
}

function getInjectableType(param: any) {
  if (typeof param === 'function' && !isClass(param)) {
    return SupportedInjectableService.function;
  } else if (
    typeof param === 'function' &&
    param !== null &&
    param.constructor &&
    param.constructor.name === 'Function' &&
    isClass(param)
  ) {
    return SupportedInjectableService.class;
  } else if (typeof param === 'object' && param !== null) {
    return SupportedInjectableService.object;
  } else {
    return SupportedInjectableService.other;
  }
}

enum Scope {
  singleton = 'singleton',
  scoped = 'scoped',
}

type Constructable<T = any> = new (...args: any[]) => T;

interface IDependency<T> {
  name: string | symbol;
  service: Constructable<T> | T;
  instance?: T;
  scope: Scope;
  type: SupportedInjectableService;
}

interface IDIServiceOptions {
  name?: string | symbol;
  scope?: Scope;
}

export class Container {
  public dependencies = new Map<string | symbol, IDependency<any>>();
  public name: string;

  constructor(name: string | symbol) {
    this.name = name.toString();
  }

  public Bind<T>(
    service: Constructable<T> | T,
    options: IDIServiceOptions = {},
  ) {
    if (service === undefined) {
      return this;
    }
    const key = options.name || (service as any)?.name;
    const injectableType = getInjectableType(service);
    const settings: IDependency<T> = {
      name: key,
      service,
      scope: options.scope || Scope.singleton,
      type: injectableType,
    };
    this.dependencies.set(key, settings);
    return this;
  }

  public resolve<T>(name: string | symbol): T {
    const service = this.dependencies.get(name);
    if (!service) {
      return null as any;
    }
    let instance: T;
    if (
      service.type === SupportedInjectableService.class &&
      service.scope === Scope.singleton &&
      !service.instance
    ) {
      const dependencies = (
        service.service.constructor.prototype.constructorDependencies || []
      ).map((name: string | symbol) => this.resolve<any>(name));
      if (dependencies?.length > 0) {
        instance = new service.service(...dependencies);
      } else {
        instance = new service.service();
      }
      const propDependencies: Map<string, any> =
        service.service.constructor.prototype.propDependencies || new Map();
      propDependencies.forEach((value, key) => {
        instance[key] = this.resolve<any>(value);
      });
      service.instance = instance;
    } else {
      instance = service.service;
    }
    return instance;
  }

  public resolveAll() {
    const dependencies: Record<string, any> = {};
    this.dependencies.forEach((value, key) => {
      dependencies[key.toString()] = this.resolve(key);
    });
    return dependencies;
  }
}
function resolveDependencies(containerNames: string[], args: any[]) {
  const diContainers = containerNames.map((containerName) =>
    GetContainer(containerName),
  );
  const dependencies =
    diContainers.length === 1
      ? diContainers[0].resolveAll()
      : diContainers.reduce((acc, container) => {
          acc[container.name] = container.resolveAll();
          return acc;
        }, {});
  const mergedArgs = [{ ...dependencies }, ...args];
  return mergedArgs;
}

abstract class InjectX {
  static containers = new Map<string | symbol, Container>();
  static defaultContainerName = 'default';
}

type Callback<T> = (...args: any[]) => T;

type InferParameters<T> = T extends (...args: infer P) => any ? P : never;

type InferParametersXFirstArg<T> = T extends (
  ...args: [infer A, ...infer P]
) => any
  ? [...P]
  : never;

type IsFunction<T> = T extends (...args: any[]) => infer R
  ? R extends (...args: any[]) => any
    ? InferParameters<R>
    : InferParametersXFirstArg<T>
  : never;
type IsFunctionForReturnType<T> = T extends (...args: any[]) => infer R
  ? R extends (...args: any[]) => any
    ? ReturnType<R>
    : ReturnType<T>
  : never;
export function GetContainer(
  container: string | symbol = InjectX.defaultContainerName,
) {
  if (!InjectX.containers.has(container.toString())) {
    InjectX.containers.set(container, new Container(container.toString()));
  }
  return InjectX.containers.get(container);
}

export function InjectIn<T extends Callback<any>>(
  callback: T,
  options?: {
    containers?: string[];
    callbackName?: string;
    resolveType?: 'eager' | 'lazy';
  },
) {
  const serializedCallbackName =
    callback.name
      ?.replace?.('_', '')
      ?.split('')
      .map?.((char, i) => (i === 0 ? char.toLowerCase() : char))
      ?.join('') || callback.name;
  const callbackName = options?.callbackName || serializedCallbackName;
  const containerNames = options?.containers || [];
  if (containerNames.length < 1) {
    containerNames.push(InjectX.defaultContainerName);
  }
  const wrappedCallback = (
    ...args: IsFunction<T>
  ): IsFunctionForReturnType<T> => {
    const mergedArgs = resolveDependencies(containerNames, args);
    const result = callback(...mergedArgs);
    if (typeof result === 'function') {
      return result(...args);
    }
    return result;
  };
  Object.defineProperty(wrappedCallback, 'name', {
    value: callbackName,
    writable: false,
  });
  return wrappedCallback;
}

export function SetDefaultContainer(name: string | symbol) {
  InjectX.defaultContainerName = name.toString();
}
