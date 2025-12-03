import Control from "ol/control/Control";
import type Interaction from "ol/interaction/Interaction";

type ToggleOptions = {
  className?: string;
  title?: string;
  html?: string;
  interaction?: Interaction;
  active?: boolean;
  disable?: boolean;
  onToggle?: (active: boolean) => void;
  attributes?: Record<string, string>;
};

export default class ToggleControl extends Control {
  private interaction_?: Interaction;
  private button_: HTMLButtonElement;

  constructor(options: ToggleOptions = {}) {
    const className = (options.className || "") + " ol-toggle";
    const element = document.createElement("div");
    element.className = className;

    const button = document.createElement("button");
    button.type = "button";
    button.className = options.className ? `${options.className}__button` : "ol-toggle-button";
    button.title = options.title || "";
    button.innerHTML = options.html ?? options.title ?? "";
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([k, v]) => button.setAttribute(k, v));
    }
    element.appendChild(button);

    super({ element });

    this.button_ = button;
    this.interaction_ = options.interaction;
    if (this.interaction_ && typeof (this.interaction_ as any).setActive === "function") {
      // ensure interaction active state matches control
      (this.interaction_ as any).setActive(!!options.active);
      (this.interaction_ as any).on?.("change:active", () => {
        this.setActive(!!(this.interaction_ as any).getActive?.());
      });
    }

    button.addEventListener("click", () => {
      this.toggle();
      options.onToggle?.(this.getActive());
    });

    // aria
    this.button_.setAttribute("aria-pressed", String(!!options.active));
    this.setActive(!!options.active);
    this.setDisable(!!options.disable);
  }

  setMap(map: import("ol/PluggableMap").PluggableMap | null) {
    // add/remove interaction when control is added/removed from map
    const prevMap = this.getMap();
    if (!map && prevMap && this.interaction_) {
      prevMap.removeInteraction(this.interaction_);
    }
    super.setMap(map);
    if (map && this.interaction_) {
      map.addInteraction(this.interaction_);
    }
  }

  getActive(): boolean {
    return this.element.classList.contains("ol-active");
  }

  setActive(b: boolean) {
    if (this.interaction_ && typeof (this.interaction_ as any).setActive === "function") {
      (this.interaction_ as any).setActive(b);
    }
    if (b) this.element.classList.add("ol-active");
    else this.element.classList.remove("ol-active");
    this.button_.setAttribute("aria-pressed", String(b));
    // Dispatch simple event for consumers
    this.dispatchEvent({ type: "change:active", active: b });
  }

  toggle() {
    this.setActive(!this.getActive());
  }

  getDisable(): boolean {
    return this.button_.disabled;
  }

  setDisable(disable: boolean) {
    this.button_.disabled = disable;
    if (disable) this.setActive(false);
    this.dispatchEvent({ type: "change:disable", disable });
  }

  setInteraction(i?: Interaction) {
    // replace interaction (if control already on map handle removal/add)
    const map = this.getMap();
    if (map && this.interaction_) map.removeInteraction(this.interaction_);
    this.interaction_ = i;
    if (map && this.interaction_) map.addInteraction(this.interaction_);
  }

  getInteraction(): Interaction | undefined {
    return this.interaction_;
  }
}