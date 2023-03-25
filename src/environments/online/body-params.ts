import { BodyEditor, Command } from '../../editor'
import * as dat from 'dat.gui'
import i18n from '../../i18n'
import { BodyControlor } from '../../body'

const BodyParamsInit = {
    BoneThickness: 3,
    HeadSize: 100,
    NoseToNeck: 100,
    ShoulderWidth: 100,
    ShoulderToHip: 100,
    ArmLength: 100,
    Forearm: 100,
    UpperArm: 100,
    HandSize: 10,
    Hips: 100,
    LegLength: 100,
    Thigh: 100,
    LowerLeg: 100,
    FootSize: 10,
}

function PushExecuteBodyParamsCommand(
    editor: BodyEditor,
    controlor: BodyControlor,
    name: keyof typeof BodyParamsInit,
    oldValue: number,
    value: number
) {
    console.log(oldValue, value)
    const cmd = {
        execute: () => {
            controlor[name] = value
        },
        undo: () => {
            controlor[name] = oldValue
        },
    }
    cmd.execute()
    editor.pushCommand(cmd)
}

export function CreateBodyParamsControls(editor: BodyEditor, gui: dat.GUI) {
    const bodyParams = {
        ...BodyParamsInit,
    }

    let currentControlor: BodyControlor | null = null
    const params = gui.addFolder(i18n.t('Body Parameters'))

    const describeMapping: Record<keyof typeof BodyParamsInit, string> = {
        BoneThickness: i18n.t('Bone Thickness'),
        HeadSize: i18n.t('Head Size'),
        NoseToNeck: i18n.t('Nose To Neck'),
        ShoulderWidth: i18n.t('Shoulder Width'),
        ShoulderToHip: i18n.t('Shoulder To Hip'),
        ArmLength: i18n.t('Arm Length'),
        Forearm: i18n.t('Forearm'),
        UpperArm: i18n.t('Upper Arm'),
        HandSize: i18n.t('Hand Size'),
        Hips: i18n.t('Hips'),
        LegLength: i18n.t('Leg Length'),
        Thigh: i18n.t('Thigh'),
        LowerLeg: i18n.t('Lower Leg'),
        FootSize: i18n.t('Foot Size'),
    }

    const proxy = new Proxy(
        {},
        {
            get: function (obj, prop: keyof typeof BodyParamsInit) {
                if (!(prop in BodyParamsInit)) return -1
                if (!currentControlor) return BodyParamsInit[prop]
                return currentControlor[prop]
            },
        }
    )
    Object.entries(BodyParamsInit).forEach(([_name, maxValue]) => {
        const name = _name as keyof typeof BodyParamsInit
        let oldValue = 0
        let changing = false
        params
            .add(proxy, name, 0.1, maxValue)
            .name(describeMapping[name])
            .onChange((value: number) => {
                if (currentControlor) {
                    // the first time
                    if (changing == false) oldValue = currentControlor[name]
                    changing = true
                    currentControlor[name] = value
                }
            })
            .onFinishChange((value: number) => {
                if (currentControlor) {
                    changing = false
                    PushExecuteBodyParamsCommand(
                        editor,
                        currentControlor,
                        name,
                        oldValue,
                        value
                    )
                    params.updateDisplay()
                }
            })
    })

    params.hide()

    editor.RegisterEvent({
        select(controlor) {
            currentControlor = controlor
            console.log('select')
            params.updateDisplay()
            params.show()
            // params.open()
        },
        unselect() {
            params.hide()
        },
    })
}
