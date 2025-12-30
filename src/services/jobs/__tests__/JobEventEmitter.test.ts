import { JobEventEmitter } from '../JobEventEmitter';
import { JobTracker, NormalizationJobStatus } from '../../../types';
import { logger } from '../../../utils/logger';

// Mock logger
jest.mock('../../../utils/logger', () => ({
  logger: {
    error: jest.fn()
  }
}));

describe('JobEventEmitter', () => {
  let emitter: JobEventEmitter;
  const mockJobs: JobTracker[] = [
    {
      jobId: 'job-1',
      type: 'REMOVE_DUPLICATES',
      datasetId: 123,
      datasetName: 'Dataset 1',
      status: NormalizationJobStatus.PROCESSING,
      message: 'Processing...',
      submittedAt: new Date('2023-10-01T10:00:00Z'),
      progressPercentage: 50,
      lastUpdated: new Date('2023-10-01T10:02:00Z')
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    emitter = new JobEventEmitter();
  });

  describe('subscribe', () => {
    it('should add listener and return unsubscribe function', () => {
      const mockListener = jest.fn();

      const unsubscribe = emitter.subscribe(mockListener);

      expect(typeof unsubscribe).toBe('function');
      expect(emitter.getListenerCount()).toBe(1);
    });

    it('should allow multiple listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const listener3 = jest.fn();

      emitter.subscribe(listener1);
      emitter.subscribe(listener2);
      emitter.subscribe(listener3);

      expect(emitter.getListenerCount()).toBe(3);
    });

    it('should not add the same listener multiple times', () => {
      const listener = jest.fn();

      emitter.subscribe(listener);
      emitter.subscribe(listener);

      expect(emitter.getListenerCount()).toBe(1);
    });
  });

  describe('unsubscribe', () => {
    it('should remove listener when unsubscribe is called', () => {
      const listener = jest.fn();

      const unsubscribe = emitter.subscribe(listener);
      expect(emitter.getListenerCount()).toBe(1);

      unsubscribe();
      expect(emitter.getListenerCount()).toBe(0);
    });

    it('should only remove the specific listener', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const listener3 = jest.fn();

      const unsubscribe1 = emitter.subscribe(listener1);
      const unsubscribe2 = emitter.subscribe(listener2);
      emitter.subscribe(listener3);

      expect(emitter.getListenerCount()).toBe(3);

      unsubscribe1();
      expect(emitter.getListenerCount()).toBe(2);

      unsubscribe2();
      expect(emitter.getListenerCount()).toBe(1);
    });

    it('should be safe to call unsubscribe multiple times', () => {
      const listener = jest.fn();

      const unsubscribe = emitter.subscribe(listener);
      unsubscribe();
      unsubscribe(); // Should not throw

      expect(emitter.getListenerCount()).toBe(0);
    });
  });

  describe('emit', () => {
    it('should call all subscribed listeners with jobs data', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const listener3 = jest.fn();

      emitter.subscribe(listener1);
      emitter.subscribe(listener2);
      emitter.subscribe(listener3);

      emitter.emit(mockJobs);

      expect(listener1).toHaveBeenCalledWith(mockJobs);
      expect(listener2).toHaveBeenCalledWith(mockJobs);
      expect(listener3).toHaveBeenCalledWith(mockJobs);
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
      expect(listener3).toHaveBeenCalledTimes(1);
    });

    it('should not fail when no listeners are subscribed', () => {
      expect(() => emitter.emit(mockJobs)).not.toThrow();
    });

    it('should handle empty jobs array', () => {
      const listener = jest.fn();
      emitter.subscribe(listener);

      emitter.emit([]);

      expect(listener).toHaveBeenCalledWith([]);
    });

    it('should continue notifying other listeners if one throws an error', () => {
      const errorListener = jest.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });
      const goodListener1 = jest.fn();
      const goodListener2 = jest.fn();

      emitter.subscribe(goodListener1);
      emitter.subscribe(errorListener);
      emitter.subscribe(goodListener2);

      emitter.emit(mockJobs);

      expect(goodListener1).toHaveBeenCalledWith(mockJobs);
      expect(goodListener2).toHaveBeenCalledWith(mockJobs);
      expect(errorListener).toHaveBeenCalledWith(mockJobs);
      
      expect(logger.error).toHaveBeenCalledWith(
        'Error notifying job event listener',
        { error: expect.any(Error) }
      );
    });

    it('should log each listener error separately', () => {
      const errorListener1 = jest.fn().mockImplementation(() => {
        throw new Error('Error 1');
      });
      const errorListener2 = jest.fn().mockImplementation(() => {
        throw new Error('Error 2');
      });

      emitter.subscribe(errorListener1);
      emitter.subscribe(errorListener2);

      emitter.emit(mockJobs);

      expect(logger.error).toHaveBeenCalledTimes(2);
      expect(logger.error).toHaveBeenCalledWith(
        'Error notifying job event listener',
        { error: expect.objectContaining({ message: 'Error 1' }) }
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Error notifying job event listener',
        { error: expect.objectContaining({ message: 'Error 2' }) }
      );
    });
  });

  describe('getListenerCount', () => {
    it('should return 0 when no listeners', () => {
      expect(emitter.getListenerCount()).toBe(0);
    });

    it('should return correct count after adding listeners', () => {
      emitter.subscribe(jest.fn());
      expect(emitter.getListenerCount()).toBe(1);

      emitter.subscribe(jest.fn());
      expect(emitter.getListenerCount()).toBe(2);

      emitter.subscribe(jest.fn());
      expect(emitter.getListenerCount()).toBe(3);
    });

    it('should return correct count after removing listeners', () => {
      const unsubscribe1 = emitter.subscribe(jest.fn());
      const unsubscribe2 = emitter.subscribe(jest.fn());
      const unsubscribe3 = emitter.subscribe(jest.fn());

      expect(emitter.getListenerCount()).toBe(3);

      unsubscribe1();
      expect(emitter.getListenerCount()).toBe(2);

      unsubscribe2();
      expect(emitter.getListenerCount()).toBe(1);

      unsubscribe3();
      expect(emitter.getListenerCount()).toBe(0);
    });
  });

  describe('clear', () => {
    it('should remove all listeners', () => {
      emitter.subscribe(jest.fn());
      emitter.subscribe(jest.fn());
      emitter.subscribe(jest.fn());

      expect(emitter.getListenerCount()).toBe(3);

      emitter.clear();

      expect(emitter.getListenerCount()).toBe(0);
    });

    it('should be safe to call when no listeners', () => {
      expect(() => emitter.clear()).not.toThrow();
      expect(emitter.getListenerCount()).toBe(0);
    });

    it('should not notify listeners after clear', () => {
      const listener = jest.fn();
      emitter.subscribe(listener);

      emitter.clear();
      emitter.emit(mockJobs);

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('memory management', () => {
    it('should not prevent garbage collection of unsubscribed listeners', () => {
      let listener: jest.Mock | null = jest.fn();
      const unsubscribe = emitter.subscribe(listener);

      unsubscribe();
      listener = null; // Simulate garbage collection

      // Emit to ensure no references are held
      emitter.emit(mockJobs);
      expect(emitter.getListenerCount()).toBe(0);
    });

    it('should handle rapid subscribe/unsubscribe cycles', () => {
      for (let i = 0; i < 100; i++) {
        const unsubscribe = emitter.subscribe(jest.fn());
        unsubscribe();
      }

      expect(emitter.getListenerCount()).toBe(0);
    });
  });

  describe('integration scenarios', () => {
    it('should handle realistic job update scenario', () => {
      const uiUpdateListener = jest.fn();
      const loggingListener = jest.fn();
      const analyticsListener = jest.fn();

      emitter.subscribe(uiUpdateListener);
      emitter.subscribe(loggingListener);
      emitter.subscribe(analyticsListener);

      // Simulate job progress updates
      const jobs1 = [{ ...mockJobs[0], progressPercentage: 25 }];
      const jobs2 = [{ ...mockJobs[0], progressPercentage: 50 }];
      const jobs3 = [{ ...mockJobs[0], progressPercentage: 100, status: NormalizationJobStatus.COMPLETED }];

      emitter.emit(jobs1);
      emitter.emit(jobs2);
      emitter.emit(jobs3);

      expect(uiUpdateListener).toHaveBeenCalledTimes(3);
      expect(loggingListener).toHaveBeenCalledTimes(3);
      expect(analyticsListener).toHaveBeenCalledTimes(3);

      expect(uiUpdateListener).toHaveBeenLastCalledWith(jobs3);
    });
  });
});



