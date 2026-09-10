export function canTransition(current: string, next: string): boolean {
  const workflow: Record<string, string[]> = {
    PENDING: ['APPROVED', 'CANCELLED'],
    APPROVED: ['SHIPPING', 'CANCELLED'],
    SHIPPING: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
  };

  return workflow[current]?.includes(next) ?? false;
}
