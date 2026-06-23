type DecimalLike = number | string | { toNumber(): number };

type ChargeWithAllocations = {
  amount: DecimalLike;
  paymentAllocations: { allocatedAmount: DecimalLike }[];
};

export function getChargeRemainingAmount(charge: ChargeWithAllocations): number {
  const chargeAmount = Number(charge.amount);
  const totalPaid = charge.paymentAllocations.reduce(
    (acc, alloc) => acc + Number(alloc.allocatedAmount),
    0
  );
  return Math.max(0, chargeAmount - totalPaid);
}

export function getOpenChargesPendingTotal(
  charges: Array<
    ChargeWithAllocations & {
      status: string;
    }
  >
): number {
  return charges
    .filter((charge) => charge.status === 'pendente' || charge.status === 'parcialmente_paga')
    .reduce((acc, charge) => acc + getChargeRemainingAmount(charge), 0);
}
