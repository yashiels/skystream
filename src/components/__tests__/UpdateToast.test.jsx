import { render, screen, fireEvent } from '@testing-library/react';
import UpdateToast from '../UpdateToast';
import { acceptUpdate, registerServiceWorker, watchForUpdate } from '../../utils/swUpdate';

jest.mock('../UpdateToast.css', () => ({}));
jest.mock('../../utils/swUpdate');

describe('UpdateToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders nothing when there is no update waiting', () => {
    registerServiceWorker.mockReturnValue(null);

    render(<UpdateToast />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('shows the reload toast once an update is detected', async () => {
    const registration = {};
    registerServiceWorker.mockReturnValue(Promise.resolve(registration));
    const waitingWorker = { id: 'waiting-worker' };
    watchForUpdate.mockImplementation((_registration, onUpdateAvailable) => {
      onUpdateAvailable(waitingWorker);
    });

    render(<UpdateToast />);

    expect(await screen.findByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/New version available/)).toBeInTheDocument();
  });

  test('calls acceptUpdate with the waiting worker when Reload is clicked', async () => {
    const registration = {};
    registerServiceWorker.mockReturnValue(Promise.resolve(registration));
    const waitingWorker = { id: 'waiting-worker' };
    watchForUpdate.mockImplementation((_registration, onUpdateAvailable) => {
      onUpdateAvailable(waitingWorker);
    });

    render(<UpdateToast />);

    const reloadButton = await screen.findByRole('button', { name: 'Reload' });
    fireEvent.click(reloadButton);

    expect(acceptUpdate).toHaveBeenCalledWith(waitingWorker);
  });
});
