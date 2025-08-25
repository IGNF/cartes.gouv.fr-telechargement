import React, { useState } from "react";
import { FaWindows, FaLinux } from "react-icons/fa";
import { Menu } from "antd";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { Button } from "@codegouvfr/react-dsfr/Button";
import ModalLinux from "./ModalLinux";
import ModalLogiciel from "./ModalLogiciel";
import ModalWindows from "./ModalWindows";

const items = [
    {
        label: 'via un logiciel',
        key: 'logiciel',
        icon: <span className="fr-icon-computer-fill" aria-hidden="true"></span>,
    },
    {
        label: 'via une ligne de commande',
        key: 'SubMenu',
        children: [
            {
                title:'windows',
                label: 'Windows',
                key: 'windows',
                icon: <FaWindows />,
            },
            {
                title:'windows',
                label: 'Linux/Mac',
                key: 'linux',
                icon: <FaLinux />
            },
        ],
    },
];

const modal = createModal({
    id: 'foo-modal',
    isOpenedByDefault: false,
});

function ModalComponent() {
    const [current, setCurrent] = useState('logiciel');

    const onClick = (e) => {
        console.log('click ', e.key);
        setCurrent('SubMenu');
    };

    return (
        <>
            <button
                type="button"
                onClick={() => modal.open()}
                className="fr-icon-information-fill"
            >
                Comment télécharger les données ?
            </button>

            <modal.Component
                title="Comment télécharger les données ?"
                width={1000}
                cancelButtonProps={{ style: { display: "none" } }}
            >
                <p>
                    Cette interface vous permet de récupérer la liste des données qui vous intéressent.
                    Pour récupérer les données facilement, il faudra automatiser le téléchargement.
                    Pour cela, vous pouvez utiliser un logiciel ou une ligne de commande :
                </p>

                <div className="menu">
                    <ul className="menu-horizontal">
                        <li
                            className={`menu-item ${current === 'logiciel' ? 'selected' : ''}`}
                            onClick={() => setCurrent('logiciel')}
                        >
                            <span className="fr-icon-computer-fill" aria-hidden="true"></span>
                            via un logiciel
                        </li>
                        <li
                            className={`menu-item ${current === 'SubMenu' ? 'selected' : ''}`}
                            onClick={() => setCurrent('SubMenu')}
                        >
                            <span className="fr-icon-settings-fill" aria-hidden="true"></span>
                            via une ligne de commande
                            <ul className="submenu">
                                <li
                                    className={`submenu-item ${current === 'windows' ? 'selected' : ''}`}
                                    onClick={() => setCurrent('windows')}
                                >
                                    <FaWindows />
                                    Windows
                                </li>
                                <li
                                    className={`submenu-item ${current === 'linux' ? 'selected' : ''}`}
                                    onClick={() => setCurrent('linux')}
                                >
                                    <FaLinux />
                                    Linux/Mac
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <br />
                {{
                    'logiciel': <ModalLogiciel />,
                    'windows': <ModalWindows />,
                    'linux': <ModalLinux />,
                }[current]}
            </modal.Component>
        </>
    );
}

export default ModalComponent;