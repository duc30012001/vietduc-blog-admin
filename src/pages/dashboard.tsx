import { PageContainer } from "@ant-design/pro-components";
import { Card, Col, Row, Statistic } from "antd";
import { useIntl } from "react-intl";

export default function DashboardPage() {
    const intl = useIntl();

    return (
        <PageContainer title={intl.formatMessage({ id: "page.dashboard.title" })}>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title={intl.formatMessage({ id: "menu.post" })}
                            value={0}
                            suffix="bài viết"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title={intl.formatMessage({ id: "menu.category" })}
                            value={0}
                            suffix="danh mục"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title={intl.formatMessage({ id: "menu.tag" })}
                            value={0}
                            suffix="thẻ"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title={intl.formatMessage({ id: "menu.comment" })}
                            value={0}
                            suffix="bình luận"
                        />
                    </Card>
                </Col>
            </Row>
        </PageContainer>
    );
}
