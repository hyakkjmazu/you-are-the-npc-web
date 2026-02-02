
export class AmbientEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isRunning = false;
  private oscillators: AudioNode[] = [];
  private stopTimeout: number | null = null;
  private volume = 0.4;

  constructor() {}

  private initContext() {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (!this.masterGain) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
    }
  }

  public setVolume(v: number) {
    this.volume = v;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
    }
  }

  public playKeyClick() {
    if (!this.ctx || this.ctx.state !== 'running' || !this.isRunning) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150 + Math.random() * 50, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.05 * this.volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  public playTypeSound() {
    if (!this.ctx || this.ctx.state !== 'running' || !this.isRunning) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100 + Math.random() * 30, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.02 * this.volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.03);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  public playSystemBlip() {
    if (!this.ctx || this.ctx.state !== 'running' || !this.isRunning) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1 * this.volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  public async start() {
    if (this.isRunning) return;
    if (this.stopTimeout) { window.clearTimeout(this.stopTimeout); this.stopTimeout = null; }
    this.initContext();
    if (this.ctx!.state === 'suspended') await this.ctx!.resume();
    this.masterGain!.gain.setValueAtTime(0, this.ctx!.currentTime);
    this.masterGain!.gain.linearRampToValueAtTime(this.volume, this.ctx!.currentTime + 2);
    [40, 40.5].forEach(freq => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.frequency.value = freq;
      g.gain.value = 0.15;
      osc.connect(g);
      g.connect(this.masterGain!);
      osc.start();
      this.oscillators.push(osc, g);
    });
    this.isRunning = true;
  }

  public stop() {
    if (this.masterGain && this.ctx && this.ctx.state !== 'closed') {
      this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
      this.isRunning = false;
      this.stopTimeout = window.setTimeout(() => {
        if (this.ctx && this.ctx.state !== 'closed') this.ctx.close().catch(() => {});
        this.ctx = null; this.masterGain = null; this.oscillators = [];
      }, 600);
    }
  }

  public toggle(force?: boolean) {
    const target = force !== undefined ? force : !this.isRunning;
    if (target) this.start(); else this.stop();
    return target;
  }
}

export const ambient = new AmbientEngine();
