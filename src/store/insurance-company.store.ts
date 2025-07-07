import { create } from "zustand";
import { InsuranceCompany } from "../pages/types/InsuranceCompany.types";
import InsuranceCompanyService from "../services/insurance-company.service";

interface InsuranceCompanyState {
  insuranceCompanies: InsuranceCompany[];
  loading: boolean;
  error: string | null;
  fetchAllCompanies: () => Promise<void>;
  addCompany: (company: Omit<InsuranceCompany, "id">) => Promise<void>;
  updateCompany: (
    companyId: string,
    data: Partial<InsuranceCompany>
  ) => Promise<void>;
  deleteCompany: (companyId: string) => Promise<void>;
  getCompanyById: (companyId: string) => InsuranceCompany | undefined;
}

const insuranceCompanyService = new InsuranceCompanyService();

export const useInsuranceCompanyStore = create<InsuranceCompanyState>(
  (set, get) => ({
    insuranceCompanies: [],
    loading: false,
    error: null,

    async fetchAllCompanies() {
      set({ loading: true, error: null });
      try {
        const insuranceCompanies =
          await insuranceCompanyService.getAllCompanies();
        set({ insuranceCompanies, loading: false });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch companies",
          loading: false,
        });
      }
    },

    async addCompany(company) {
      set({ loading: true, error: null });
      try {
        await insuranceCompanyService.addCompany(company);
        // Refresh the list after adding
        await get().fetchAllCompanies();
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to add company",
          loading: false,
        });
        throw error; // Re-throw for form handling
      }
    },

    async updateCompany(companyId, data) {
      set({ loading: true, error: null });
      try {
        await insuranceCompanyService.updateCompany(companyId, data);
        // Update local state without refetching
        set((state) => ({
          insuranceCompanies: state.insuranceCompanies.map((company) =>
            company.id === companyId ? { ...company, ...data } : company
          ),
          loading: false,
        }));
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to update company",
          loading: false,
        });
        throw error;
      }
    },

    async deleteCompany(companyId) {
      set({ loading: true, error: null });
      try {
        await insuranceCompanyService.deleteCompany(companyId);
        set((state) => ({
          insuranceCompanies: state.insuranceCompanies.filter(
            (company) => company.id !== companyId
          ),
          loading: false,
        }));
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to delete company",
          loading: false,
        });
        throw error;
      }
    },

    getCompanyById(companyId) {
      return get().insuranceCompanies.find(
        (company) => company.id === companyId
      );
    },
  })
);
