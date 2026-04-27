<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen && row" class="modal-overlay" @click="onCancel">
        <div class="modal-container" role="dialog" :aria-label="t('restocking.modal.title')" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">{{ t('restocking.modal.title') }}</h3>
            <button class="close-button" @click="onCancel" :aria-label="t('restocking.modal.cancel')">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="item-summary">
              <div>
                <div class="muted">{{ t('restocking.modal.item') }}</div>
                <div class="strong">{{ row.name }}</div>
                <div class="muted small">{{ t('restocking.modal.sku') }}: {{ row.sku }} · {{ row.warehouse }}</div>
              </div>
              <span :class="['badge', `priority-${row.priority}`]">{{ row.priority }}</span>
            </div>

            <div v-if="successMessage" class="alert alert-success">
              <strong>{{ t('restocking.modal.successTitle') }}</strong>
              <div>{{ successMessage }}</div>
            </div>

            <div v-if="errorMessage" class="alert alert-error">
              <strong>{{ t('restocking.modal.errorTitle') }}</strong>
              <div>{{ errorMessage }}</div>
            </div>

            <form v-if="!successMessage" @submit.prevent="onSubmit">
              <div class="form-grid">
                <label class="field">
                  <span>{{ t('restocking.modal.supplier') }}</span>
                  <input
                    v-model.trim="form.supplier_name"
                    type="text"
                    required
                    :placeholder="t('restocking.modal.supplierPlaceholder')"
                  />
                </label>

                <label class="field">
                  <span>{{ t('restocking.modal.quantity') }}</span>
                  <input v-model.number="form.quantity" type="number" min="1" required />
                </label>

                <label class="field">
                  <span>{{ t('restocking.modal.unitCost') }}</span>
                  <input v-model.number="form.unit_cost" type="number" min="0" step="0.01" required />
                </label>

                <label class="field">
                  <span>{{ t('restocking.modal.expectedDelivery') }}</span>
                  <input v-model="form.expected_delivery_date" type="date" required />
                </label>

                <label class="field full">
                  <span>{{ t('restocking.modal.notes') }}</span>
                  <textarea
                    v-model="form.notes"
                    rows="2"
                    :placeholder="t('restocking.modal.notesPlaceholder')"
                  ></textarea>
                </label>
              </div>

              <div class="total-row">
                <span class="muted">{{ t('restocking.modal.totalCost') }}</span>
                <span class="strong">{{ formatCurrency(totalCost) }}</span>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-ghost" @click="onCancel">
                  {{ t('restocking.modal.cancel') }}
                </button>
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  {{ submitting ? t('restocking.modal.submitting') : t('restocking.modal.submit') }}
                </button>
              </div>
            </form>

            <div v-else class="modal-actions">
              <button class="btn btn-primary" @click="onCancel">{{ t('restocking.modal.cancel') }}</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { api } from '../api'
import { useI18n } from '../composables/useI18n'

const today = () => new Date().toISOString().slice(0, 10)
const inTwoWeeks = () => {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  return d.toISOString().slice(0, 10)
}

export default {
  name: 'PurchaseOrderModal',
  props: {
    isOpen: { type: Boolean, default: false },
    row: { type: Object, default: null },
  },
  emits: ['close', 'created'],
  setup(props, { emit }) {
    const { t, currentLocale, currentCurrency } = useI18n()

    const form = ref({
      supplier_name: '',
      quantity: 0,
      unit_cost: 0,
      expected_delivery_date: inTwoWeeks(),
      notes: '',
    })
    const submitting = ref(false)
    const successMessage = ref('')
    const errorMessage = ref('')

    watch(
      () => props.row,
      (row) => {
        if (!row) return
        form.value = {
          supplier_name: '',
          quantity: row.recommended_quantity,
          unit_cost: row.unit_cost,
          expected_delivery_date: inTwoWeeks(),
          notes: '',
        }
        successMessage.value = ''
        errorMessage.value = ''
      },
      { immediate: true }
    )

    const totalCost = computed(() => {
      const q = Number(form.value.quantity) || 0
      const c = Number(form.value.unit_cost) || 0
      return q * c
    })

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

    const onCancel = () => emit('close')

    const onSubmit = async () => {
      if (submitting.value) return
      errorMessage.value = ''
      submitting.value = true
      try {
        const created = await api.createRestockPurchaseOrder({
          sku: props.row.sku,
          supplier_name: form.value.supplier_name,
          quantity: form.value.quantity,
          unit_cost: form.value.unit_cost,
          expected_delivery_date: form.value.expected_delivery_date,
          notes: form.value.notes || null,
        })
        successMessage.value = t('restocking.modal.successBody', {
          id: created.id,
          supplier: created.supplier_name,
          qty: created.quantity,
        })
        emit('created', { sku: props.row.sku, po: created })
      } catch (err) {
        errorMessage.value = err.response?.data?.detail || err.message
      } finally {
        submitting.value = false
      }
    }

    return {
      t,
      form,
      totalCost,
      submitting,
      successMessage,
      errorMessage,
      formatCurrency,
      onCancel,
      onSubmit,
    }
  },
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}
.modal-container {
  background: white;
  border-radius: 12px;
  max-width: 560px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}
.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
}
.close-button {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 0.25rem;
  border-radius: 6px;
}
.close-button:hover { background: #f1f5f9; color: #0f172a; }

.modal-body { padding: 1.5rem; }

.item-summary {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}
.muted { color: #64748b; font-size: 0.813rem; }
.muted.small { font-size: 0.75rem; margin-top: 0.25rem; }
.strong { font-weight: 600; color: #0f172a; font-size: 1rem; }

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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}
.field { display: flex; flex-direction: column; gap: 0.375rem; }
.field.full { grid-column: 1 / -1; }
.field span {
  font-size: 0.813rem;
  font-weight: 600;
  color: #475569;
}
.field input,
.field textarea {
  padding: 0.625rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.938rem;
  color: #0f172a;
  font-family: inherit;
}
.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1rem;
  background: #f1f5f9;
  border-radius: 8px;
  margin-bottom: 1rem;
}
.total-row .strong { font-size: 1.125rem; }

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.938rem;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s;
}
.btn-primary { background: #3b82f6; color: white; }
.btn-primary:hover:not(:disabled) { background: #2563eb; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-ghost { background: white; color: #475569; border-color: #cbd5e1; }
.btn-ghost:hover { background: #f1f5f9; }

.alert {
  padding: 0.875rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  line-height: 1.5;
}
.alert-success { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
.alert-error { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }

.modal-enter-active,
.modal-leave-active { transition: opacity 0.2s; }
.modal-enter-from,
.modal-leave-to { opacity: 0; }
</style>
