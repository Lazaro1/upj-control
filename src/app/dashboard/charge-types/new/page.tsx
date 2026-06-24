import { ChargeTypeForm } from '@/features/charge-types/components/charge-type-form';
import { assertFinancialWritePage } from '@/lib/auth/roles';

export default async function NewChargeTypePage() {
  await assertFinancialWritePage();

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
      <ChargeTypeForm />
    </div>
  );
}
