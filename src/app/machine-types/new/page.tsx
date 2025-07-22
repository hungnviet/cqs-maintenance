import MachineTypeForm from '@/components/machine-types/MachineTypeForm';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function NewMachineTypePage() {
  return (
    <MachineTypeForm mode="create" />
  );
}