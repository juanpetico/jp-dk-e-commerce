import { listAbandonedCartsUseCase } from "./automation/use-cases/list-abandoned-carts.js";
import { notifyAbandonedCartUseCase } from "./automation/use-cases/notify-abandoned-cart.js";
import { listVipCandidatesUseCase } from "./automation/use-cases/list-vip-candidates.js";
import { grantVipAccessUseCase } from "./automation/use-cases/grant-vip-access.js";
import { listReviewRequestsUseCase } from "./automation/use-cases/list-review-requests.js";
import { notifyReviewRequestUseCase } from "./automation/use-cases/notify-review-request.js";

export const automationService = {
    listAbandonedCarts: listAbandonedCartsUseCase,
    notifyAbandonedCart: notifyAbandonedCartUseCase,
    listVipCandidates: listVipCandidatesUseCase,
    grantVipAccess: grantVipAccessUseCase,
    listReviewRequests: listReviewRequestsUseCase,
    notifyReviewRequest: notifyReviewRequestUseCase,
};
