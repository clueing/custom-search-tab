<script setup lang="ts">
import { useSearchEngines } from '@/composables/useSearchEngines'

const { suggestEnabled, toggleSuggest } = useSearchEngines()
</script>

<template>
    <div class="space-y-6">
        <div>
            <h2 class="text-lg font-semibold text-gray-800 mb-4">搜索设置</h2>

            <!-- 搜索建议开关 -->
            <div class="flex items-center justify-between py-3">
                <div class="flex-1">
                    <h3 class="font-medium text-gray-800">搜索建议</h3>
                    <p class="text-sm text-gray-500 mt-1">由百度提供，关闭后可提升隐私保护</p>
                </div>
                <button @click="toggleSuggest" :class="[
                    'relative w-12 h-6 rounded-full transition-colors',
                    suggestEnabled ? 'bg-blue-500' : 'bg-gray-300'
                ]">
                    <span :class="[
                        'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                        suggestEnabled ? 'left-7' : 'left-1'
                    ]" />
                </button>
            </div>
        </div>
    </div>
</template>
