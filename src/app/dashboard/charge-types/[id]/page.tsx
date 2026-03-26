import { getChargeTypeById } from '@/features/charge-types/server/charge-type.actions';
import { ChargeTypeForm } from '@/features/charge-types/components/charge-type-form';
import { notFound } from 'next/navigation';

export default async function EditChargeTypePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const chargeType = await getChargeTypeById(params.id);

  if (!chargeType) {
    notFound();
  }

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
      <ChargeTypeForm initialData={chargeType} />
    </div>
  );
}
