export type Emergency = { name: string; phone: string };
export type Waiver = { signed: string; by: string; type: "Drawn" | "Typed" };
export type Member = {
  id: string; accountId: string; rel: string; name: string; dob?: string | null; email?: string | null; gender?: string | null;
  memberCode: string; emergency?: Emergency | null; waiver?: Waiver | null; createdAt: string;
};
export type Account = { id: string; phone: string; createdAt: string };
export type Trial = {
  id: string; accountId?: string | null; name: string; phone: string; email?: string | null; discipline: string; ageGroup?: string | null;
  experience?: string | null; slot?: { classId?: string; date?: string; title: string; day: string; time: string; coach?: string } | null; status: string; createdAt: string;
};
export type Staff = { id: string; phone: string; name: string; role: "owner" | "coach" | "frontdesk"; coachKey?: string | null };

export interface Store {
  accountByPhone(phone: string): Promise<Account | null>;
  accountById(id: string): Promise<Account | null>;
  createAccount(phone: string): Promise<Account>;
  members(accountId: string): Promise<Member[]>;
  allMembers(): Promise<(Member & { phone: string })[]>;
  addMember(m: Omit<Member, "id" | "memberCode" | "createdAt">): Promise<Member>;
  updateMember(accountId: string, id: string, patch: Partial<Omit<Member, "id" | "accountId" | "memberCode" | "createdAt">>): Promise<Member | null>;
  deleteMember(accountId: string, id: string): Promise<boolean>;
  addTrial(t: Omit<Trial, "id" | "createdAt" | "status">): Promise<Trial>;
  trials(): Promise<Trial[]>;
  setTrialStatus(id: string, status: string): Promise<Trial | null>;
  staffByPhone(phone: string): Promise<Staff | null>;
  staffById(id: string): Promise<Staff | null>;
}
