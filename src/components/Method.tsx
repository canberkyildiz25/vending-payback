/** How the numbers are worked out. Shared by the calculator and the proposal. */
export function MethodList({ className = "" }: { className?: string }) {
  return (
    <ul className={`m-0 flex flex-col gap-1 pl-[18px] ${className}`}>
      <li>Monthly sales today = machines × sales per machine per day × selling days.</li>
      <li>
        Extra gross profit = monthly sales today × sales increase × gross margin. Only the margin counts as gain, not the
        full extra revenue.
      </li>
      <li>Card processing fees apply to the card and phone share of the new, higher sales.</li>
      <li>Net gain per month = extra gross profit + cash handling saved − processing fees − reader service fees.</li>
      <li>Payback period = reader price for the whole fleet ÷ net gain per month.</li>
    </ul>
  );
}

export function Signature({ className = "" }: { className?: string }) {
  return <p className={`m-0 text-[13px] ${className}`}>Built by Canberk Yıldız, international B2B sales.</p>;
}
