export enum ControllerButtons {
  // TODO I don't understand the use case for this yet,
  // so leaving it commented out for now.
  // Enroll = Math.pow(2, 0,
  Nexus = 14,
  Menu = 13,
  View = 12,
  A = 11,
  B = 10,
  X = 9,
  Y = 8,
  DPadUp = 7,
  DPadDown = 6,
  DPadLeft = 5,
  DPadRight = 4,
  LeftShoulder = 3,
  RightShoulder = 2,
  LeftThumbStick = 1,
  RightThumbStick = 0,
}

// TODO only buttons seem to work here. Not sure how to get the analog controls working.
export class Controller {
  static Buttons = ControllerButtons;
  // 16 bits, all 0 to start.
  private buttons = new Array(16).fill(0);
  private leftTrigger = 0;
  private rightTrigger = 0;
  private leftThumbStickX = 0;
  private leftThumbStickY = 0;
  private rightThumbStickX = 0;
  private rightThumbStickY = 0;

  getState() {
    return {
      buttons: parseInt(this.buttons.join(""), 2),
      leftTrigger: this.leftTrigger,
      rightTrigger: this.rightTrigger,
      leftThumbStickX: this.leftThumbStickX,
      leftThumbStickY: this.leftThumbStickY,
      rightThumbStickX: this.rightThumbStickX,
      rightThumbStickY: this.rightThumbStickY,
    };
  }

  async pressButton(button: ControllerButtons, time?: number) {
    if (button > 15 || button < 0) {
      throw new Error("Button value must be between 0 and 15.");
    }
    this.buttons[button] = 1;

    if (time) {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          this.buttons[button] = 0;
          resolve();
        }, time);
      });
    }
  }

  releaseButton(button: ControllerButtons) {
    this.buttons[button] = 0;
  }

  quickPressButton(button: ControllerButtons) {
    this.buttons[button] = 1;
    setTimeout(() => {
      this.buttons[button] = 0;
    }, 200);
  }

  releaseAllButtons() {
    this.buttons = new Array(16).fill(0);
  }
}
