export default class SimulatorService {
  private static instance: SimulatorService;
  private constructor() {
    // ...
  }

  public static getInstance(): SimulatorService {
    if (!SimulatorService.instance) {
      SimulatorService.instance = new SimulatorService();
    }
    return SimulatorService.instance;
  }

  public assemble(code: string): string {
    return "assembled " + code;
  }
}
