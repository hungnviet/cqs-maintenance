export interface MaintenanceTemplate {
  frequency: string;
  groups: {
    groupTitle: string;
    requirements: {
      titleEng: string;
      titleVn: string;
      note?: string;
    }[];
  }[];
}

export interface Machine {
  machineName: string;
  machineCode: string;
  images: string[];
  machineType: {
    typeName: string;
    machineTypeCode: string;
  };
}

export interface MaintenanceFormProps {
  template: MaintenanceTemplate;
  machine?: Machine;
  renderMachineImages: (images: string[]) => React.ReactNode;
}
