<script>
	// Static MBTI types with descriptions and icons
	const mbtiTypes = [
		"INFP", "INFJ", "INTP", "INTJ",
		"ISFP", "ISFJ", "ISTP", "ISTJ",
		"ENFP", "ENFJ", "ENTP", "ENTJ",
		"ESFP", "ESFJ", "ESTP", "ESTJ"
	];

	// MBTI type descriptions and icons
	const mbtiInfo = {
		INFP: { icon: '🦄', description: '夢想家', bgColor: 'bg-purple-50' },
		INFJ: { icon: '🔮', description: '智者', bgColor: 'bg-purple-50' },
		INTP: { icon: '🧠', description: '思想家', bgColor: 'bg-pink-50' },
		INTJ: { icon: '🧩', description: '策略家', bgColor: 'bg-green-50' },
		ISFP: { icon: '🎨', description: '藝術家', bgColor: 'bg-yellow-50' },
		ISFJ: { icon: '🏡', description: '守護者', bgColor: 'bg-yellow-50' },
		ISTP: { icon: '🔧', description: '工匠', bgColor: 'bg-blue-50' },
		ISTJ: { icon: '📊', description: '檢查者', bgColor: 'bg-blue-50' },
		ENFP: { icon: '✨', description: '冒險家', bgColor: 'bg-yellow-50' },
		ENFJ: { icon: '🌟', description: '主角', bgColor: 'bg-yellow-50' },
		ENTP: { icon: '💡', description: '辯論家', bgColor: 'bg-orange-50' },
		ENTJ: { icon: '👑', description: '指揮官', bgColor: 'bg-orange-50' },
		ESFP: { icon: '🎭', description: '表演者', bgColor: 'bg-red-50' },
		ESFJ: { icon: '🤝', description: '執行者', bgColor: 'bg-yellow-50' },
		ESTP: { icon: '🏄', description: '企業家', bgColor: 'bg-orange-50' },
		ESTJ: { icon: '⚖️', description: '管理者', bgColor: 'bg-blue-50' }
	};

	// Text colors for each type
	const textColors = {
		INFP: 'text-purple-700',
		INFJ: 'text-purple-800',
		INTP: 'text-pink-700',
		INTJ: 'text-green-700',
		ISFP: 'text-amber-700',
		ISFJ: 'text-amber-800',
		ISTP: 'text-blue-700',
		ISTJ: 'text-blue-800',
		ENFP: 'text-yellow-700',
		ENFJ: 'text-yellow-800',
		ENTP: 'text-orange-700',
		ENTJ: 'text-orange-800',
		ESFP: 'text-red-700',
		ESFJ: 'text-yellow-800',
		ESTP: 'text-orange-700',
		ESTJ: 'text-blue-800'
	};

	// Icon background colors
	const iconBgColors = {
		INFP: 'bg-purple-100',
		INFJ: 'bg-purple-100',
		INTP: 'bg-pink-100',
		INTJ: 'bg-green-100',
		ISFP: 'bg-amber-100',
		ISFJ: 'bg-amber-100',
		ISTP: 'bg-blue-100',
		ISTJ: 'bg-blue-100',
		ENFP: 'bg-yellow-100',
		ENFJ: 'bg-yellow-100',
		ENTP: 'bg-orange-100',
		ENTJ: 'bg-orange-100',
		ESFP: 'bg-red-100',
		ESFJ: 'bg-yellow-100',
		ESTP: 'bg-orange-100',
		ESTJ: 'bg-blue-100'
	};
</script>

<div class="w-full max-w-3xl mx-auto px-4 py-6">
	<!-- MBTI Type Grid -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		{#each mbtiTypes as type}
			<a
				href={`/suggestion/${type}`}
				class="group relative"
			>
				<div class={`mbti-card ${mbtiInfo[type].bgColor} rounded-xl shadow-sm overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-md`}>
					<!-- Card content -->
					<div class="p-4 flex flex-col items-center justify-center h-full relative z-10">
						<div class={`w-12 h-12 flex items-center justify-center ${iconBgColors[type]} rounded-full mb-2`}>
							<span class="text-2xl">{mbtiInfo[type].icon}</span>
						</div>
						<div class={`text-base font-bold ${textColors[type]} mb-1`}>{type}</div>
						<div class={`text-xs ${textColors[type]} opacity-90`}>{mbtiInfo[type].description}</div>
					</div>
				</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.mbti-card {
		height: 120px;
		transition: all 0.3s ease;
		position: relative;
	}

	@media (min-width: 768px) {
		.mbti-card {
			height: 140px;
		}
	}
</style>