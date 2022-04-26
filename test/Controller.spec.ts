import { expect } from "chai";
import { Controller, ControllerButtons } from "../src/Controller";
import "mocha";

// Returns the numeric value for the given button.
const getButtonValue = (button: ControllerButtons) => {
  return Math.pow(2, 15 - button);
};

describe("Controller", () => {
  let controller: Controller;
  beforeEach(() => {
    controller = new Controller();
  });

  describe("Buttons", () => {
    it("should handle calls to press", () => {
      controller.pressButton(ControllerButtons.X);

      expect(controller.getState().buttons).to.equal(
        getButtonValue(ControllerButtons.X)
      );
    });

    it("should handle calls to release", () => {
      controller.pressButton(ControllerButtons.X);
      controller.releaseButton(ControllerButtons.X);

      expect(controller.getState().buttons).to.equal(0);
    });

    it("should handle releasing an unpressed button", () => {
      controller.pressButton(ControllerButtons.X);
      controller.releaseButton(ControllerButtons.A);

      expect(controller.getState().buttons).to.equal(
        getButtonValue(ControllerButtons.X)
      );
    });

    it("should handle pressing multiple buttons", () => {
      controller.pressButton(ControllerButtons.X);
      controller.pressButton(ControllerButtons.A);

      expect(controller.getState().buttons).to.equal(
        getButtonValue(ControllerButtons.X) +
          getButtonValue(ControllerButtons.A)
      );
    });

    it("should handle multiple calls to press", () => {
      controller.pressButton(Controller.Buttons.A);
      controller.pressButton(Controller.Buttons.A);

      expect(controller.getState().buttons).to.equal(
        getButtonValue(ControllerButtons.A)
      );
    });

    it("should handle releasing a press after the provided time", async () => {
      controller.pressButton(ControllerButtons.A, 200);

      expect(controller.getState().buttons).to.equal(
        getButtonValue(ControllerButtons.A)
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Still pressed!
      expect(controller.getState().buttons).to.equal(
        getButtonValue(ControllerButtons.A)
      );

      await new Promise((resolve) => setTimeout(resolve, 110));

      // No longer pressed!
      expect(controller.getState().buttons).to.equal(0);
    });

    it("should handle releasing all buttons", () => {
      controller.pressButton(ControllerButtons.A);
      controller.pressButton(ControllerButtons.Nexus);
      controller.pressButton(ControllerButtons.Menu);

      expect(controller.getState().buttons).to.be.greaterThan(0);

      controller.releaseAllButtons();

      expect(controller.getState().buttons).to.equal(0);
    });
  });
});
