export const getTimelineEvents = () => {
  return {
    coded: {
      before: [
        { time: '-10s', event: 'PE', description: 'Prep Event' },
        { time: '-8s', event: 'IE', description: 'Init Event' },
        { time: '-5s', event: 'SE', description: 'Start Event' },
        { time: '-3s', event: 'CE', description: 'Code Event' },
        { time: '-1s', event: 'PE', description: 'Prep Event' }
      ],
      after: [
        { time: '+1s', event: 'SG', description: 'Start Gesture' },
        { time: '+3s', event: 'EG', description: 'End Gesture' },
        { time: '+5s', event: 'CG', description: 'Complete Gesture' },
        { time: '+7s', event: 'PE', description: 'Post Event' },
        { time: '+10s', event: 'FE', description: 'Final Event' }
      ]
    },
    eclipse: {
      before: [
        { time: '-9s', event: 'ES', description: 'Eclipse Start' },
        { time: '-6s', event: 'EP', description: 'Eclipse Progress' },
        { time: '-3s', event: 'EM', description: 'Eclipse Middle' },
        { time: '-2s', event: 'EA', description: 'Eclipse Approach' }
      ],
      after: [
        { time: '+2s', event: 'ED', description: 'Eclipse Depart' },
        { time: '+4s', event: 'EE', description: 'Eclipse End' },
        { time: '+6s', event: 'ER', description: 'Eclipse Recovery' },
        { time: '+8s', event: 'EC', description: 'Eclipse Complete' }
      ]
    },
    modifiable: {
      before: [
        { time: '-7s', event: 'MS', description: 'Mod Start' },
        { time: '-4s', event: 'MC', description: 'Mod Change' },
        { time: '-2s', event: 'MU', description: 'Mod Update' }
      ],
      after: [
        { time: '+1s', event: 'MA', description: 'Mod Apply' },
        { time: '+3s', event: 'MV', description: 'Mod Verify' },
        { time: '+5s', event: 'MF', description: 'Mod Finish' },
        { time: '+7s', event: 'MR', description: 'Mod Result' }
      ]
    }
  };
};