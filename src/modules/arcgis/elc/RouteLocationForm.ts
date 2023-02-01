function createLabelAndControl(
  name: string,
  type: HTMLInputElement["type"],
  properties: Record<keyof HTMLInputElement, string | number | Date>
) {
  const input = document.createElement("input");
  input.name = name;
  const label = document.createElement("label");
  label.textContent = name;
  input.id = label.htmlFor = crypto.randomUUID();
}

const defs = {
  id: "number",
  route: "string",
  decrease: "boolean",
  referenceDate: "Date",
  responseDate: "Date",
  srmp: "number",
  back: "boolean",
  arm: "number",
  endReferenceDate: "Date",
  endResponseDate: "Date",
  endSrmp: "number",
  endBack: "boolean",
  endArm: "number",
};

export class RouteLocationsInputControl extends HTMLFormElement {
  // implements Partial<ArmLine>, Partial<SrmpLine>
  public idControl: HTMLInputElement | undefined; // : number | null = null;
  public routeControl: HTMLInputElement | undefined; // : string | null = null;
  public decreaseControl: HTMLInputElement | undefined; // : boolean | null = null;
  public referenceDateControl: HTMLInputElement | undefined; // : Date | string | null = null;
  public responseDateControl: HTMLInputElement | undefined; // : Date | string | null = null;
  public srmpControl: HTMLInputElement | undefined; // : number | null = null;
  public backControl: HTMLInputElement | undefined; // : boolean | null = null;
  public armControl: HTMLInputElement | undefined; // : number | null = null;
  public endReferenceDateControl: HTMLInputElement | undefined; // : Date | string | null = null;
  public endResponseDateControl: HTMLInputElement | undefined; // : Date | string | null = null;
  public endSrmpControl: HTMLInputElement | undefined; // : number | null = null;
  public endBackControl: HTMLInputElement | undefined; // : boolean | null = null;
  public endArmControl: HTMLInputElement | undefined; // : number | null = null;

  // accessors
  public get routeLocationId(): number | undefined {
    return this.idControl?.valueAsNumber;
  }
  public get route(): string | undefined {
    return this.routeControl?.value;
  }
  public get decrease(): boolean | undefined {
    return this.decreaseControl?.checked;
  }
  public get referenceDate(): Date | string | undefined {
    return this.referenceDateControl?.value;
  }
  public get responseDate(): Date | string | undefined {
    return this.responseDateControl?.value;
  }
  public get srmp(): number | undefined {
    return this.srmpControl?.valueAsNumber;
  }
  public get back(): boolean | undefined {
    return this.backControl?.checked;
  }
  public get arm(): number | undefined {
    return this.armControl?.valueAsNumber;
  }
  public get endReferenceDate(): Date | string | undefined {
    return this.endReferenceDateControl?.value;
  }
  public get endResponseDate(): Date | string | undefined {
    return this.endResponseDateControl?.value;
  }
  public get endSrmp(): number | undefined {
    return this.endSrmpControl?.valueAsNumber;
  }
  public get endBack(): boolean | undefined {
    return this.endBackControl?.checked;
  }
  public get endArm(): number | undefined {
    return this.endArmControl?.valueAsNumber;
  }

  constructor() {
    super();

    const shadowRoot = this.attachShadow({
      mode: "closed",
    });
  }
}

customElements.define("route-location-form", RouteLocationsInputControl, {
  extends: "form"
})