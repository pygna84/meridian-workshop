<template>
  <div class="restocking">
    <div class="page-header">
      <h2>{{ t('restocking.title') }}</h2>
      <p>{{ t('restocking.subtitle') }}</p>
    </div>

    <div class="card budget-card">
      <label class="budget-label" for="budget-input">{{ t('restocking.budgetLabel') }}</label>
      <div class="budget-input-row">
        <span class="currency-symbol">{{ currencySymbol }}</span>
        <input
          id="budget-input"
          v-model="budgetInput"
          type="number"
          min="0"
          step="100"
          class="budget-input"
          :placeholder="t('restocking.budgetPlaceholder')"
        />
        <button class="generate-btn" @click="loadData" :disabled="loading">
          {{ t('restocking.generate') }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <template v-else-if="result">
      <!-- Summary -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">{{ t('restocking.summaryItems') }}</div>
          <div class="stat-value">{{ result.item_count }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('restocking.summaryCost') }}</div>
          <div class="stat-value">{{ formatCurrency(result.total_cost) }}</div>
        </div>
        <div class="stat-card warning" v-if="result.deferred_count > 0">
          <div class="stat-label">{{ t('restocking.summaryDeferred') }}</div>
          <div class="stat-value">{{ result.deferred_count }} · {{ formatCurrency(result.deferred_cost) }}</div>
        </div>
        <div class="stat-card success" v-if="parsedBudget && remainingBudget > 0">
          <div class="stat-label">{{ t('restocking.summaryUnused') }}</div>
          <div class="stat-value">{{ formatCurrency(remainingBudget) }}</div>
        </div>
      </div>

      <!-- Recommended -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('restocking.recommendedHeading') }}</h3>
        </div>
        <table class="restock-table">
          <thead>
            <tr>
              <th>{{ t('restocking.priority') }}</th>
              <th>{{ t('restocking.sku') }}</th>
              <th>{{ t('restocking.item') }}</th>
              <th>{{ t('restocking.warehouse') }}</th>
              <th class="num">{{ t('restocking.onHand') }}</th>
              <th class="num">{{ t('restocking.reorderPoint') }}</th>
              <th class="num">{{ t('restocking.recommendedQty') }}</th>
              <th class="num">{{ t('restocking.unitCost') }}</th>
              <th class="num">{{ t('restocking.estCost') }}</th>
              <th>{{ t('restocking.action') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!result.recommendations.length">
              <td colspan="10" class="empty">{{ t('restocking.nothingToRestock') }}</td>
            </tr>
            <tr v-for="row in result.recommendations" :key="row.sku">
              <td><span :class="['badge', `priority-${row.priority}`]">{{ row.priority }}</span></td>
              <td><strong>{{ row.sku }}</strong></td>
              <td>
                {{ row.name }}
                <small v-if="row.forecast_lift > 0" class="hint">
                  {{ t('restocking.forecastLift', { qty: row.forecast_lift }) }}
                </small>
              </td>
              <td>{{ row.warehouse }}</td>
              <td class="num">{{ row.quantity_on_hand.toLocaleString(currentLocale) }}</td>
              <td class="num">{{ row.reorder_point.toLocaleString(currentLocale) }}</td>
              <td class="num"><strong>{{ row.recommended_quantity.toLocaleString(currentLocale) }}</strong></td>
              <td class="num">{{ formatCurrency(row.unit_cost) }}</td>
              <td class="num">{{ formatCurrency(row.estimated_cost) }}</td>
              <td>
                <span v-if="createdSkus.has(row.sku)" class="po-created">✓ {{ t('restocking.poCreated') }}</span>
                <button v-else class="row-action" @click="openModal(row)">{{ t('restocking.createPo') }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Deferred -->
      <div class="card deferred-card" v-if="result.deferred.length">
        <div class="card-header">
          <h3 class="card-title">{{ t('restocking.deferredHeading') }}</h3>
        </div>
        <table class="restock-table">
          <thead>
            <tr>
              <th>{{ t('restocking.priority') }}</th>
              <th>{{ t('restocking.sku') }}</th>
              <th>{{ t('restocking.item') }}</th>
              <th>{{ t('restocking.warehouse') }}</th>
              <th class="num">{{ t('restocking.recommendedQty') }}</th>
              <th class="num">{{ t('restocking.estCost') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in result.deferred" :key="row.sku">
              <td><span :class="['badge', `priority-${row.priority}`]">{{ row.priority }}</span></td>
              <td><strong>{{ row.sku }}</strong></td>
              <td>{{ row.name }}</td>
              <td>{{ row.warehouse }}</td>
              <td class="num">{{ row.recommended_quantity.toLocaleString(currentLocale) }}</td>
              <td class="num">{{ formatCurrency(row.estimated_cost) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <PurchaseOrderModal
      :is-open="modalOpen"
      :row="modalRow"
      @close="closeModal"
      @created="onPoCreated"
    />
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, reactive } from 'vue'
import { api } from '../api'
import { useFilters } from '../composables/useFilters'
import { useI18n } from '../composables/useI18n'
import PurchaseOrderModal from '../components/PurchaseOrderModal.vue'

export default {
  name: 'Restocking',
  components: { PurchaseOrderModal },
  setup() {
    const { selectedLocation, selectedCategory } = useFilters()
    const { t, currentLocale, currentCurrency } = useI18n()

    const loading = ref(true)
    const error = ref(null)
    const result = ref(null)
    const budgetInput = ref('')

    const parsedBudget = computed(() => {
      const n = parseFloat(budgetInput.value)
      return Number.isFinite(n) && n > 0 ? n : null
    })

    const remainingBudget = computed(() => {
      if (!parsedBudget.value || !result.value) return 0
      return Math.max(0, parsedBudget.value - result.value.total_cost)
    })

    const currencySymbol = computed(() =>
      currentCurrency.value === 'JPY' ? '¥' : '$'
    )

    const formatCurrency = (value) => {
      const locale = currentLocale.value === 'ja' ? 'ja-JP' : 'en-US'
      const fractionDigits = currentCurrency.value === 'JPY' ? 0 : 2
      return (value ?? 0).toLocaleString(locale, {
        style: 'currency',
        currency: currentCurrency.value,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      })
    }

    const loadData = async () => {
      loading.value = true
      error.value = null
      try {
        result.value = await api.getRestockingRecommendations({
          warehouse: selectedLocation.value,
          category: selectedCategory.value,
          budget: parsedBudget.value,
        })
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    watch([selectedLocation, selectedCategory], () => loadData())
    onMounted(loadData)

    const modalOpen = ref(false)
    const modalRow = ref(null)
    const createdSkus = reactive(new Set())

    const openModal = (row) => {
      modalRow.value = row
      modalOpen.value = true
    }
    const closeModal = () => {
      modalOpen.value = false
    }
    const onPoCreated = ({ sku }) => {
      createdSkus.add(sku)
    }

    return {
      t,
      currentLocale,
      currencySymbol,
      loading,
      error,
      result,
      budgetInput,
      parsedBudget,
      remainingBudget,
      formatCurrency,
      loadData,
      modalOpen,
      modalRow,
      createdSkus,
      openModal,
      closeModal,
      onPoCreated,
    }
  },
}
</script>

<style scoped>
.restocking { padding: 0; }

.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.budget-card { display: flex; flex-direction: column; gap: 0.75rem; }
.budget-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.budget-input-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.currency-symbol {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}
.budget-input {
  flex: 1;
  max-width: 320px;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1.125rem;
  color: #0f172a;
}
.budget-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.generate-btn {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.generate-btn:hover:not(:disabled) { background: #2563eb; }
.generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.card-header { margin-bottom: 1rem; }
.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.restock-table { width: 100%; border-collapse: collapse; }
.restock-table th {
  background: #f8fafc;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  font-size: 0.813rem;
  border-bottom: 2px solid #e2e8f0;
}
.restock-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}
.restock-table .num { text-align: right; }
.restock-table tr:hover { background: #f8fafc; }
.empty { text-align: center; color: #94a3b8; padding: 2rem 0; }

.hint {
  display: block;
  font-size: 0.75rem;
  color: #2563eb;
  margin-top: 0.25rem;
}

.badge {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}
.priority-high { background: #fee2e2; color: #991b1b; }
.priority-medium { background: #fef3c7; color: #92400e; }
.priority-low { background: #dbeafe; color: #1e40af; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #3b82f6;
}
.stat-card.warning { border-left-color: #f59e0b; }
.stat-card.success { border-left-color: #10b981; }
.stat-label {
  font-size: 0.813rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.deferred-card { border-top: 3px solid #f59e0b; }

.row-action {
  padding: 0.4rem 0.85rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.813rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.row-action:hover { background: #2563eb; }

.po-created {
  font-size: 0.813rem;
  color: #16a34a;
  font-weight: 600;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}
.error {
  background: #fee2e2;
  color: #991b1b;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}
</style>
