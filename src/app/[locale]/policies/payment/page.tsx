import { PolicyLayout } from "@/components/layout/PolicyLayout/PolicyLayout";
import { POLICIES } from "@/lib/policies-content";

const policy = POLICIES.payment;

export const metadata = { title: `${policy.title} — nurvishop` };

export default function Policy_payment_Page() {
  return (
    <PolicyLayout title={policy.title} lastUpdated={policy.lastUpdated}>
      <div dangerouslySetInnerHTML={{ __html: policy.html }} />
    </PolicyLayout>
  );
}
