import { acceptUpdate, registerServiceWorker, watchForUpdate } from '../swUpdate';

const createFakeServiceWorkerContainer = () => {
  const target = new EventTarget();
  return {
    controller: null,
    register: jest.fn().mockResolvedValue(undefined),
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
    dispatchEvent: target.dispatchEvent.bind(target),
  };
};

describe('registerServiceWorker', () => {
  afterEach(() => {
    delete navigator.serviceWorker;
  });

  it('registers /sw.js with updateViaCache: none', () => {
    const fakeContainer = createFakeServiceWorkerContainer();
    Object.defineProperty(navigator, 'serviceWorker', { value: fakeContainer, configurable: true });

    registerServiceWorker();

    expect(fakeContainer.register).toHaveBeenCalledWith('/sw.js', { updateViaCache: 'none' });
  });

  it('returns null when service workers are unsupported', () => {
    expect(registerServiceWorker()).toBeNull();
  });
});

describe('watchForUpdate', () => {
  it('reports an already-waiting worker immediately', () => {
    const onUpdateAvailable = jest.fn();
    const registration = { waiting: { id: 'waiting-worker' }, addEventListener: jest.fn() };

    watchForUpdate(registration, onUpdateAvailable);

    expect(onUpdateAvailable).toHaveBeenCalledWith(registration.waiting);
  });

  it('reports a newly-installed worker only once a controller already exists', () => {
    const fakeContainer = createFakeServiceWorkerContainer();
    Object.defineProperty(navigator, 'serviceWorker', { value: fakeContainer, configurable: true });
    fakeContainer.controller = { id: 'existing-controller' };

    const onUpdateAvailable = jest.fn();
    const registrationTarget = new EventTarget();
    const installingWorkerTarget = new EventTarget();
    const installingWorker = {
      state: 'installing',
      addEventListener: installingWorkerTarget.addEventListener.bind(installingWorkerTarget),
    };
    const registration = {
      waiting: null,
      installing: installingWorker,
      addEventListener: registrationTarget.addEventListener.bind(registrationTarget),
    };

    watchForUpdate(registration, onUpdateAvailable);
    registrationTarget.dispatchEvent(new Event('updatefound'));

    installingWorker.state = 'installed';
    installingWorkerTarget.dispatchEvent(new Event('statechange'));

    expect(onUpdateAvailable).toHaveBeenCalledWith(installingWorker);

    delete navigator.serviceWorker;
  });

  it('does not report the first-install worker when there is no existing controller', () => {
    const fakeContainer = createFakeServiceWorkerContainer();
    Object.defineProperty(navigator, 'serviceWorker', { value: fakeContainer, configurable: true });
    fakeContainer.controller = null;

    const onUpdateAvailable = jest.fn();
    const registrationTarget = new EventTarget();
    const installingWorkerTarget = new EventTarget();
    const installingWorker = {
      state: 'installing',
      addEventListener: installingWorkerTarget.addEventListener.bind(installingWorkerTarget),
    };
    const registration = {
      waiting: null,
      installing: installingWorker,
      addEventListener: registrationTarget.addEventListener.bind(registrationTarget),
    };

    watchForUpdate(registration, onUpdateAvailable);
    registrationTarget.dispatchEvent(new Event('updatefound'));

    installingWorker.state = 'installed';
    installingWorkerTarget.dispatchEvent(new Event('statechange'));

    expect(onUpdateAvailable).not.toHaveBeenCalled();

    delete navigator.serviceWorker;
  });
});

describe('acceptUpdate', () => {
  afterEach(() => {
    delete navigator.serviceWorker;
  });

  it('does nothing when there is no waiting worker', () => {
    const reload = jest.fn();
    acceptUpdate(null, reload);
    expect(reload).not.toHaveBeenCalled();
  });

  it('an unarmed listener never reloads on the first-install controllerchange', () => {
    const fakeContainer = createFakeServiceWorkerContainer();
    Object.defineProperty(navigator, 'serviceWorker', { value: fakeContainer, configurable: true });
    const reload = jest.fn();

    // No call to acceptUpdate() has happened yet, so no listener is armed.
    fakeContainer.dispatchEvent(new Event('controllerchange'));

    expect(reload).not.toHaveBeenCalled();
  });

  it('an armed listener reloads exactly once after SKIP_WAITING and controllerchange', () => {
    const fakeContainer = createFakeServiceWorkerContainer();
    Object.defineProperty(navigator, 'serviceWorker', { value: fakeContainer, configurable: true });
    const reload = jest.fn();
    const worker = { postMessage: jest.fn() };

    acceptUpdate(worker, reload);

    expect(worker.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });

    fakeContainer.dispatchEvent(new Event('controllerchange'));
    fakeContainer.dispatchEvent(new Event('controllerchange'));

    expect(reload).toHaveBeenCalledTimes(1);
  });
});
