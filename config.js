exports.data = {
	systems: {
		gb: {
			name: "Gameboy",
			shortname: "gameboy",
			romfileextentions: [
				'gb',
				'gbc'
			]
		},
		gba: {
			name: "Gameboy Advance",
			shortname: "GBA",
			romfileextentions: [
				'gba'
			]
		},
		nes: {
			name: "Nintendo Entermainment System",
			shortname: "NES",
			romfileextentions: [
				'nes'
			]
		},
		snes: {
			name: "Super Nintendo Entermainment System",
			shortname: "SNES",
			romfileextentions: [
				'smc'
			]
		},
		gen: {
			name: "Sega Genesis",
			shortname: "Genesis",
			romfileextentions: [
				'bin',
				'32x'
			]
		},
		sms: {
			name: "Sega Master System",
			shortname: "Master System",
			romfileextentions: []
		},
		lynx: {
			name: "Atari Lynx",
			shortname: "Lynx",
			romfileextentions: []
		}
	},
	search: {
		boxFrontThreshold: 83,
		searchAllThreshold: 86,
		suggestionThreshold: 86
	}
};